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

console.warn('[DEPRECATED] scripts/_deprecated/generate_alphabet_model.js is deprecated.');
