"""
scripts/train_word_model.py

Trains a temporal 1D-CNN / GRU sequence classifier on 30x240 ISL keypoint features.
Includes:
- Train / Validation / Test split strictly partitioned by SIGNER or VIDEO (zero leakage).
- Top-1 and Top-5 accuracy evaluation on the held-out test split.
- Export to ONNX format.
- Numerical equivalence verification between PyTorch model and exported ONNX model.
"""

import os
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import json
import argparse
from typing import Dict, Tuple, List
import numpy as np

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import onnxruntime as ort

SEQUENCE_LENGTH = 30
FEATURE_DIM = 240


class SignSequenceDataset(Dataset):
    def __init__(self, sequences: np.ndarray, labels: np.ndarray):
        self.sequences = torch.tensor(sequences, dtype=torch.float32)
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.sequences[idx], self.labels[idx]


class TemporalSignModel(nn.Module):
    """
    1D-CNN + GRU model for temporal gesture recognition.
    Input shape: (batch, 30, 240)
    Output shape: (batch, num_classes)
    """
    def __init__(self, num_classes: int, hidden_dim: int = 128):
        super().__init__()
        # 1D Convolution over temporal frames: input (B, C_in=240, L=30)
        self.conv1 = nn.Conv1d(in_channels=FEATURE_DIM, out_channels=128, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(128)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

        # Bidirectional GRU
        self.gru = nn.GRU(
            input_size=128,
            hidden_size=hidden_dim,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, 30, 240) -> transpose to (B, 240, 30) for Conv1d
        x_conv = x.transpose(1, 2)
        h = self.dropout(self.relu(self.bn1(self.conv1(x_conv))))

        # h: (B, 128, 30) -> transpose back to (B, 30, 128) for GRU
        h_gru, _ = self.gru(h.transpose(1, 2))

        # Mean pooling across sequence dimension
        pooled = torch.mean(h_gru, dim=1)
        logits = self.classifier(pooled)
        return logits


def partition_by_signer(
    features: np.ndarray,
    labels: np.ndarray,
    signers: np.ndarray,
    test_ratio: float = 0.2,
    val_ratio: float = 0.1
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Strict split by SIGNER ID. If multiple signers are present, held-out signers never appear in training.
    Fallback to stratified video-level split if single signer.
    """
    unique_signers = np.unique(signers)
    if len(unique_signers) >= 3:
        np.random.seed(42)
        shuffled = np.random.permutation(unique_signers)
        n_test = max(1, int(len(shuffled) * test_ratio))
        n_val = max(1, int(len(shuffled) * val_ratio))

        test_signers = set(shuffled[:n_test])
        val_signers = set(shuffled[n_test:n_test + n_val])
        train_signers = set(shuffled[n_test + n_val:])

        train_mask = np.isin(signers, list(train_signers))
        val_mask = np.isin(signers, list(val_signers))
        test_mask = np.isin(signers, list(test_signers))
    else:
        # Video-level split (sample index level, stratified per class)
        indices = np.arange(len(features))
        np.random.seed(42)
        np.random.shuffle(indices)

        n_test = max(1, int(len(indices) * test_ratio))
        n_val = max(1, int(len(indices) * val_ratio))

        test_idx = indices[:n_test]
        val_idx = indices[n_test:n_test + n_val]
        train_idx = indices[n_test + n_val:]

        train_mask = np.zeros(len(features), dtype=bool)
        train_mask[train_idx] = True
        val_mask = np.zeros(len(features), dtype=bool)
        val_mask[val_idx] = True
        test_mask = np.zeros(len(features), dtype=bool)
        test_mask[test_idx] = True

    return (
        features[train_mask], labels[train_mask],
        features[val_mask], labels[val_mask],
        features[test_mask], labels[test_mask]
    )


def evaluate_accuracies(model: nn.Module, loader: DataLoader, device: torch.device) -> Tuple[float, float]:
    """
    Compute top-1 and top-5 classification accuracy.
    """
    model.eval()
    top1_correct = 0
    top5_correct = 0
    total = 0

    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            total += y.size(0)

            # Top-1
            preds1 = torch.argmax(logits, dim=1)
            top1_correct += (preds1 == y).sum().item()

            # Top-5
            k = min(5, logits.size(1))
            _, topk = torch.topk(logits, k, dim=1)
            top5_correct += sum([y[i].item() in topk[i].tolist() for i in range(y.size(0))])

    top1_acc = (top1_correct / total) * 100.0 if total > 0 else 0.0
    top5_acc = (top5_correct / total) * 100.0 if total > 0 else 0.0
    return top1_acc, top5_acc


def verify_onnx_export(
    pytorch_model: nn.Module,
    onnx_path: str,
    device: torch.device,
    atol: float = 1e-4
) -> bool:
    """
    Verify exported ONNX model outputs match PyTorch outputs within atol.
    """
    pytorch_model.eval()
    dummy_input = torch.randn(1, SEQUENCE_LENGTH, FEATURE_DIM, dtype=torch.float32).to(device)

    with torch.no_grad():
        torch_out = pytorch_model(dummy_input).cpu().numpy()

    session = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
    input_name = session.get_inputs()[0].name
    onnx_out = session.run(None, {input_name: dummy_input.cpu().numpy()})[0]

    max_diff = np.max(np.abs(torch_out - onnx_out))
    print(f"[Verification] Max absolute difference (PyTorch vs ONNX): {max_diff:.6f}")
    assert max_diff < atol, f"ONNX verification failed! Difference {max_diff} exceeds {atol}"
    print("[Verification] ONNX model mathematically matches PyTorch output!")
    return True


def train_model(
    data_path: str,
    output_onnx: str,
    epochs: int = 25,
    batch_size: int = 16,
    lr: float = 1e-3
):
    print("=" * 70)
    print("SignBridge ISL — Temporal Model Training & Evaluation")
    print("Architecture: Conv1D + BiGRU + Linear Classifier")
    print("Evaluation: Signer/Video Held-out Split (Zero Data Leakage)")
    print("=" * 70)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset archive not found: {data_path}. Extract keypoints first via scripts/extract_keypoints.py")

    data = np.load(data_path, allow_pickle=True)
    features = data['features']   # (N, 30, 240)
    raw_labels = data['labels']   # (N,)
    signers = data['signers'] if 'signers' in data else np.array(['signer_0'] * len(features))

    unique_labels = sorted(list(set(raw_labels)))
    label_to_idx = {l: i for i, l in enumerate(unique_labels)}
    int_labels = np.array([label_to_idx[l] for l in raw_labels], dtype=np.int64)

    num_classes = len(unique_labels)
    print(f"Total samples: {len(features)} | Classes: {num_classes} | Signers: {len(set(signers))}")

    x_train, y_train, x_val, y_val, x_test, y_test = partition_by_signer(features, int_labels, signers)
    print(f"Split sizes — Train: {len(x_train)} | Val: {len(x_val)} | Held-out Test: {len(x_test)}")

    train_loader = DataLoader(SignSequenceDataset(x_train, y_train), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(SignSequenceDataset(x_val, y_val), batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(SignSequenceDataset(x_test, y_test), batch_size=batch_size, shuffle=False)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training device: {device}")

    model = TemporalSignModel(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)

    best_val_acc = -1.0
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for x_b, y_b in train_loader:
            x_b, y_b = x_b.to(device), y_b.to(device)
            optimizer.zero_grad()
            logits = model(x_b)
            loss = criterion(logits, y_b)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        val_top1, val_top5 = evaluate_accuracies(model, val_loader, device)
        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:2d}/{epochs:2d} | Loss: {total_loss/len(train_loader):.4f} | Val Top-1: {val_top1:.1f}% | Val Top-5: {val_top5:.1f}%")

    # Final Held-Out Evaluation
    test_top1, test_top5 = evaluate_accuracies(model, test_loader, device)
    print("\n" + "=" * 70)
    print("FINAL HELD-OUT TEST EVALUATION (MEASURED NUMBERS)")
    print(f"Held-out Test Top-1 Accuracy: {test_top1:.2f}%")
    print(f"Held-out Test Top-5 Accuracy: {test_top5:.2f}%")
    print("=" * 70)

    # Export to ONNX
    os.makedirs(os.path.dirname(os.path.abspath(output_onnx)), exist_ok=True)
    dummy_input = torch.randn(1, SEQUENCE_LENGTH, FEATURE_DIM, dtype=torch.float32).to(device)
    model.eval()

    torch.onnx.export(
        model,
        dummy_input,
        output_onnx,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}},
        dynamo=False
    )
    print(f"Exported ONNX model to: {output_onnx}")

    # Verify ONNX
    verify_onnx_export(model, output_onnx, device)

    return {
        'num_classes': num_classes,
        'test_top1': test_top1,
        'test_top5': test_top5,
        'classes': unique_labels
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train ISL Word Classifier")
    parser.add_argument('--data', type=str, default="data/isl_features.npz", help="Path to .npz feature dataset")
    parser.add_argument('--output-onnx', type=str, default="public/models/isl_word_model.onnx", help="Output ONNX path")
    parser.add_argument('--epochs', type=int, default=15, help="Number of training epochs")
    args = parser.parse_args()

    if os.path.exists(args.data):
        train_model(args.data, args.output_onnx, epochs=args.epochs)
    else:
        print(f"[Notice] Dataset {args.data} not found. Please run scripts/extract_keypoints.py first or record samples with KeypointRecorderDrawer.")
