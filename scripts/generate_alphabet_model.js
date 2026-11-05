import pb from 'protobufjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoStr = `
syntax = "proto3";
package onnx;

message TensorShapeProto {
  message Dimension {
    int64 dim_value = 1;
    string dim_param = 2;
  }
  repeated Dimension dim = 1;
}

message TensorTypeProto {
  int32 elem_type = 1;
  TensorShapeProto shape = 2;
}

message TypeProto {
  TensorTypeProto tensor_type = 1;
}

message ValueInfoProto {
  string name = 1;
  TypeProto type = 2;
}

message TensorProto {
  repeated int64 dims = 1;
  int32 data_type = 2;
  repeated float float_data = 4;
  string name = 8;
  bytes raw_data = 9;
}

message AttributeProto {
  string name = 1;
  float f = 2;
  int64 i = 3;
  string s = 4;
  TensorProto t = 5;
  int32 type = 20;
}

message NodeProto {
  repeated string input = 1;
  repeated string output = 2;
  string name = 3;
  string op_type = 4;
  repeated AttributeProto attribute = 5;
}

message GraphProto {
  repeated NodeProto node = 1;
  string name = 2;
  repeated TensorProto initializer = 5;
  repeated ValueInfoProto input = 11;
  repeated ValueInfoProto output = 12;
}

message OperatorSetIdProto {
  string domain = 1;
  int64 version = 2;
}

message ModelProto {
  int64 ir_version = 1;
  string producer_name = 2;
  GraphProto graph = 7;
  repeated OperatorSetIdProto opset_import = 8;
}
`;

const root = pb.parse(protoStr).root;
const ModelProto = root.lookupType('onnx.ModelProto');

const inDim = 240;  // 80 keypoints x 3 (x, y, z)
const outDim = 36; // 26 letters (A-Z) + 10 digits (0-9)

// Initialize weights using Xavier/Glorot initialization: variance = 2.0 / (inDim + outDim)
const W_data = new Float32Array(inDim * outDim);
const stddev = Math.sqrt(2.0 / (inDim + outDim));

// Deterministic pseudo-random generator (Linear Congruential Generator) for reproducible weights
let seed = 42;
function randomNormal() {
  // Box-Muller transform
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  const u1 = (seed + 1) / 4294967297;
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  const u2 = (seed + 1) / 4294967297;
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

for (let i = 0; i < W_data.length; i++) {
  W_data[i] = randomNormal() * stddev;
}

// Biases initialized with slight class priors
const B_data = new Float32Array(outDim);
for (let c = 0; c < outDim; c++) {
  B_data[c] = (c < 26 ? 0.05 : 0.0); // Slight natural prior for A-Z
}

const modelObj = {
  irVersion: 8,
  producerName: 'signbridge-isl',
  opsetImport: [{ domain: '', version: 17 }],
  graph: {
    name: 'isl_alphabet_mlp',
    node: [
      {
        input: ['input', 'W', 'B'],
        output: ['output'],
        name: 'gemm_1',
        opType: 'Gemm',
        attribute: [
          { name: 'alpha', f: 1.0, type: 1 },
          { name: 'beta', f: 1.0, type: 1 },
          { name: 'transB', i: 0, type: 2 }
        ]
      }
    ],
    initializer: [
      {
        name: 'W',
        dims: [inDim, outDim],
        dataType: 1, // FLOAT
        rawData: new Uint8Array(W_data.buffer)
      },
      {
        name: 'B',
        dims: [outDim],
        dataType: 1, // FLOAT
        rawData: new Uint8Array(B_data.buffer)
      }
    ],
    input: [
      {
        name: 'input',
        type: {
          tensorType: {
            elemType: 1, // FLOAT
            shape: {
              dim: [{ dimValue: 1 }, { dimValue: inDim }]
            }
          }
        }
      }
    ],
    output: [
      {
        name: 'output',
        type: {
          tensorType: {
            elemType: 1, // FLOAT
            shape: {
              dim: [{ dimValue: 1 }, { dimValue: outDim }]
            }
          }
        }
      }
    ]
  }
};

const msg = ModelProto.create(modelObj);
const buffer = ModelProto.encode(msg).finish();

const targetDir = path.resolve(__dirname, '../public/models');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, 'isl_alphabet_mlp.onnx');
fs.writeFileSync(targetPath, buffer);

console.log(`[generate_alphabet_model] Generated valid ONNX model: ${targetPath} (${buffer.length} bytes)`);
