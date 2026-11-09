/**
 * @deprecated
 * =========================================================================
 * WARNING: DEPRECATED — DO NOT USE IN PRODUCTION OR TESTS
 * =========================================================================
 * This script creates single-layer Gemm models with Xavier-random weights.
 * Per project invariants, NO random-weight, untrained, or placeholder models
 * may be shipped or used for recognition claims.
 * Real models must be trained on authentic datasets via:
 *   scripts/train_word_model.py
 * =========================================================================
 */

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

const seqLen = 30;
const featureDim = 240;
const inDim = seqLen * featureDim; // 7,200

let seed = 1337;
function randomNormal() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  const u1 = (seed + 1) / 4294967297;
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  const u2 = (seed + 1) / 4294967297;
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function buildModelBuffer(graphName, outDim) {
  const totalWeights = inDim * outDim;
  const W_data = new Float32Array(totalWeights);
  const stddev = Math.sqrt(2.0 / (inDim + outDim));

  for (let i = 0; i < totalWeights; i++) {
    W_data[i] = randomNormal() * stddev;
  }

  const B_data = new Float32Array(outDim);
  for (let c = 0; c < outDim; c++) {
    B_data[c] = 0.02;
  }

  const modelObj = {
    irVersion: 8,
    producerName: 'signbridge-isl-temporal-deprecated',
    opsetImport: [{ domain: '', version: 17 }],
    graph: {
      name: graphName,
      node: [
        {
          input: ['input', 'W', 'B'],
          output: ['output'],
          name: 'gemm_temporal',
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
  return ModelProto.encode(msg).finish();
}

console.warn('[DEPRECATED] scripts/_deprecated/generate_word_model.js is deprecated.');
