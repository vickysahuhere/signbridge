import * as ort from 'onnxruntime-web';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

async function testThreads() {
  const modelBuf = fs.readFileSync('public/models/isl_include_50.onnx');
  for (const threads of [1, 2, 4]) {
    ort.env.wasm.numThreads = threads;
    const session = await ort.InferenceSession.create(modelBuf);
    const input = new ort.Tensor('float32', new Float32Array(7200), [1, 7200]);
    for (let i = 0; i < 5; i++) await session.run({ input });
    const times = [];
    for (let i = 0; i < 50; i++) {
      const t0 = performance.now();
      await session.run({ input });
      times.push(performance.now() - t0);
    }
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Threads ${threads}: mean latency = ${mean.toFixed(3)} ms`);
  }
}
testThreads().catch(console.error);
