import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GlossBufferManager } from '../src/nlp/glossBufferManager.js';

test('GlossBufferManager - rejects null, empty or invalid tokens', () => {
  const manager = new GlossBufferManager();
  assert.equal(manager.push(null), false);
  assert.equal(manager.push(''), false);
  assert.equal(manager.push('   '), false);
  assert.equal(manager.push(123), false);
  assert.equal(manager.size(), 0);
  assert.equal(manager.isEmpty(), true);
});

test('GlossBufferManager - automatically deduplicates adjacent identical signs (LING-01)', () => {
  const manager = new GlossBufferManager();
  assert.equal(manager.push('HELLO'), true);
  assert.equal(manager.push('HELLO'), false);
  assert.equal(manager.push('HELLO'), false);

  assert.equal(manager.size(), 1);
  assert.deepEqual(manager.getGlosses(), ['HELLO']);

  // Adding a different sign succeeds
  assert.equal(manager.push('YOU'), true);
  assert.equal(manager.size(), 2);
  assert.deepEqual(manager.getGlosses(), ['HELLO', 'YOU']);

  // Adding HELLO again now succeeds since it is not adjacent
  assert.equal(manager.push('HELLO'), true);
  assert.equal(manager.size(), 3);
  assert.deepEqual(manager.getGlosses(), ['HELLO', 'YOU', 'HELLO']);
});

test('GlossBufferManager - concatenates contiguous fingerspelled characters into words', () => {
  const manager = new GlossBufferManager();
  assert.equal(manager.push('NAME', 'word'), true);
  assert.equal(manager.push('R', 'letter'), true);
  assert.equal(manager.push('A', 'letter'), true);
  assert.equal(manager.push('H', 'letter'), true);
  assert.equal(manager.push('U', 'letter'), true);
  assert.equal(manager.push('L', 'letter'), true);

  assert.equal(manager.size(), 2);
  assert.deepEqual(manager.getGlosses(), ['NAME', 'RAHUL']);

  // Adding another word after spelled name
  assert.equal(manager.push('HELLO', 'word'), true);
  assert.equal(manager.size(), 3);
  assert.deepEqual(manager.getGlosses(), ['NAME', 'RAHUL', 'HELLO']);
});

test('GlossBufferManager - undo() removes the most recent token (LING-02)', () => {
  const manager = new GlossBufferManager();
  manager.push('HELLO');
  manager.push('YOU');
  manager.push('HOSPITAL');

  assert.equal(manager.size(), 3);
  const undone = manager.undo();
  assert.equal(undone, 'HOSPITAL');
  assert.equal(manager.size(), 2);
  assert.deepEqual(manager.getGlosses(), ['HELLO', 'YOU']);

  manager.undo();
  manager.undo();
  assert.equal(manager.size(), 0);
  assert.equal(manager.isEmpty(), true);
  assert.equal(manager.undo(), null);
});

test('GlossBufferManager - clear() empties the buffer completely (LING-02)', () => {
  const manager = new GlossBufferManager();
  manager.push('HELLO');
  manager.push('WHAT');
  assert.equal(manager.size(), 2);

  manager.clear();
  assert.equal(manager.size(), 0);
  assert.equal(manager.isEmpty(), true);
  assert.deepEqual(manager.getGlosses(), []);
});
