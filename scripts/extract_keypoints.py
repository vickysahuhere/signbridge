"""
scripts/extract_keypoints.py

MediaPipe Keypoint Extraction & 240-Float Normalization Pipeline for ISL.
Matches the client-side JavaScript normalization contract in src/vision/normalizeLandmarks.js.

DATASET CITATION & LICENSE AUDIT:
- Dataset: AI4Bharat INCLUDE / INCLUDE-50
- Paper: "INCLUDE: A Large Scale Dataset for Indian Sign Language Recognition" (ACM MM '20)
- License: MIT License (Permissive commercial and research use)
- Availability: Zenodo Record 4010759 (56.8 GB full videos) / HuggingFace `ai4bharat/INCLUDE`
- Vocabulary: 50 classes (INCLUDE-50 subset: 766 train videos, 192 test videos)
"""

import os
import sys
import json
import math
import argparse
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

# Exact indices from src/vision/normalizeLandmarks.js
POSE_INDICES = [0, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23]
FACE_INDICES = [
    # Lips
    13, 14, 78, 308, 82, 312, 87, 317,
    # Eyebrows
    70, 63, 105, 66, 107, 300, 293, 334, 296, 336,
    # Anchors
    33, 133, 362, 263, 1, 4, 152, 10
]

TOTAL_KEYPOINTS = 80
FEATURE_DIM = 240
SEQUENCE_LENGTH = 30


def normalize_frame_landmarks(
    left_hand: Optional[List[Dict[str, float]]],
    right_hand: Optional[List[Dict[str, float]]],
    pose: Optional[List[Dict[str, float]]],
    face: Optional[List[Dict[str, float]]]
) -> np.ndarray:
    """
    Python implementation of extractAndNormalizeFrame() from src/vision/normalizeLandmarks.js.
    Strictly outputs np.ndarray of shape (240,) float32.
    """
    pose_list = pose or []
    left_list = left_hand or []
    right_list = right_hand or []
    face_list = face or []

    # 1. Shoulder Midpoint
    left_shoulder = pose_list[11] if len(pose_list) > 11 else {'x': 0.4, 'y': 0.5, 'z': 0.0}
    right_shoulder = pose_list[12] if len(pose_list) > 12 else {'x': 0.6, 'y': 0.5, 'z': 0.0}

    ls_x = left_shoulder.get('x', 0.4)
    ls_y = left_shoulder.get('y', 0.5)
    ls_z = left_shoulder.get('z', 0.0)

    rs_x = right_shoulder.get('x', 0.6)
    rs_y = right_shoulder.get('y', 0.5)
    rs_z = right_shoulder.get('z', 0.0)

    center_x = (ls_x + rs_x) / 2.0
    center_y = (ls_y + rs_y) / 2.0
    center_z = (ls_z + rs_z) / 2.0

    # 2. Shoulder Scale
    dx = ls_x - rs_x
    dy = ls_y - rs_y
    scale = math.hypot(dx, dy)
    if scale == 0.0 or math.isnan(scale):
        scale = 0.25

    features = np.zeros(FEATURE_DIM, dtype=np.float32)
    offset = 0

    def write_point(pt: Optional[Dict[str, float]]):
        nonlocal offset
        if not pt or pt.get('x') is None or pt.get('y') is None or math.isnan(pt['x']) or math.isnan(pt['y']):
            features[offset] = 0.0
            features[offset + 1] = 0.0
            features[offset + 2] = 0.0
        else:
            features[offset] = (pt['x'] - center_x) / scale
            features[offset + 1] = (pt['y'] - center_y) / scale
            features[offset + 2] = (pt.get('z', 0.0) - center_z) / scale
        offset += 3

    # 3. Left Hand points (0 - 20)
    for i in range(21):
        pt = left_list[i] if i < len(left_list) else None
        write_point(pt)

    # 4. Right Hand points (0 - 20)
    for i in range(21):
        pt = right_list[i] if i < len(right_list) else None
        write_point(pt)

    # 5. Pose points (12 selected)
    for idx in POSE_INDICES:
        pt = pose_list[idx] if idx < len(pose_list) else None
        write_point(pt)

    # 6. Face points (26 selected)
    for idx in FACE_INDICES:
        pt = face_list[idx] if idx < len(face_list) else None
        write_point(pt)

    return features


def resample_sequence(frames: np.ndarray, target_len: int = SEQUENCE_LENGTH) -> np.ndarray:
    """
    Temporally resample or pad frame sequence to exactly target_len frames.
    """
    n_frames = len(frames)
    if n_frames == 0:
        return np.zeros((target_len, FEATURE_DIM), dtype=np.float32)

    if n_frames == target_len:
        return frames.astype(np.float32)

    # Linear temporal interpolation
    indices = np.linspace(0, n_frames - 1, target_len)
    resampled = np.zeros((target_len, FEATURE_DIM), dtype=np.float32)
    for i in range(FEATURE_DIM):
        resampled[:, i] = np.interp(indices, np.arange(n_frames), frames[:, i])

    return resampled


def process_video_file(video_path: str, mp_holistic) -> np.ndarray:
    """
    Process raw video file using MediaPipe HolisticLandmarker into (30, 240) normalized sequence.
    """
    import cv2
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise IOError(f"Cannot open video file: {video_path}")

    frame_features = []
    with mp_holistic.Holistic(
        min_detection_confidence=0.3,
        min_tracking_confidence=0.3,
        model_complexity=1
    ) as holistic:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(image_rgb)

            left_hand = [{'x': p.x, 'y': p.y, 'z': p.z} for p in results.left_hand_landmarks.landmark] if results.left_hand_landmarks else []
            right_hand = [{'x': p.x, 'y': p.y, 'z': p.z} for p in results.right_hand_landmarks.landmark] if results.right_hand_landmarks else []
            pose = [{'x': p.x, 'y': p.y, 'z': p.z} for p in results.pose_landmarks.landmark] if results.pose_landmarks else []
            face = [{'x': p.x, 'y': p.y, 'z': p.z} for p in results.face_landmarks.landmark] if results.face_landmarks else []

            feat = normalize_frame_landmarks(left_hand, right_hand, pose, face)
            frame_features.append(feat)

    cap.release()
    if len(frame_features) == 0:
        return np.zeros((SEQUENCE_LENGTH, FEATURE_DIM), dtype=np.float32)

    return resample_sequence(np.array(frame_features, dtype=np.float32))


def parse_webcam_recordings_json(json_path: str) -> Tuple[np.ndarray, List[str], List[str]]:
    """
    Parse recordings exported from KeypointRecorderDrawer.
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    recordings = data if isinstance(data, list) else data.get('recordings', [])
    sequences = []
    labels = []
    signers = []

    for item in recordings:
        label = item.get('gloss') or item.get('label') or 'UNKNOWN'
        signer = item.get('signer') or item.get('signerId') or 'default_signer'
        frames = item.get('frames') or []

        seq_feats = []
        for fr in frames:
            if isinstance(fr, list) and len(fr) == FEATURE_DIM:
                seq_feats.append(fr)
            elif isinstance(fr, dict) and 'features' in fr:
                seq_feats.append(fr['features'])
            elif isinstance(fr, dict) and ('landmarks' in fr or 'pose' in fr):
                # Raw landmark dictionary
                feat = normalize_frame_landmarks(
                    fr.get('leftHandLandmarks') or fr.get('left_hand'),
                    fr.get('rightHandLandmarks') or fr.get('right_hand'),
                    fr.get('poseLandmarks') or fr.get('pose'),
                    fr.get('faceLandmarks') or fr.get('face')
                )
                seq_feats.append(feat)

        if len(seq_feats) > 0:
            resampled = resample_sequence(np.array(seq_feats, dtype=np.float32))
            sequences.append(resampled)
            labels.append(label)
            signers.append(signer)

    return np.array(sequences, dtype=np.float32), labels, signers


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="MediaPipe ISL Keypoint Extractor")
    parser.add_argument('--input-dir', type=str, help="Directory containing ISL videos or webcam JSON exports")
    parser.add_argument('--json-file', type=str, help="Webcam recording JSON export from KeypointRecorderDrawer")
    parser.add_argument('--output-npz', type=str, default="data/isl_features.npz", help="Output .npz file")
    args = parser.parse_args()

    print("=" * 70)
    print("SignBridge ISL — MediaPipe Keypoint Extraction & Normalization")
    print("Dataset Target: AI4Bharat INCLUDE (MIT License)")
    print("Feature Format: 30 frames x 240 floats (Float32Array[7200])")
    print("=" * 70)

    if args.json_file and os.path.exists(args.json_file):
        print(f"Loading recordings from: {args.json_file}")
        seqs, labels, signers = parse_webcam_recordings_json(args.json_file)
        print(f"Loaded {len(seqs)} sequences across {len(set(labels))} classes and {len(set(signers))} signers.")
        os.makedirs(os.path.dirname(os.path.abspath(args.output_npz)), exist_ok=True)
        np.savez_compressed(args.output_npz, features=seqs, labels=labels, signers=signers)
        print(f"Saved dataset archive to: {args.output_npz}")
    else:
        print("[Notice] Run with --json-file <path.json> to convert recorder recordings, or provide --input-dir.")
