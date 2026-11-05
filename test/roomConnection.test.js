import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoomId, extractRoomId, getRoomChannel } from '../src/network/supabaseClient.js';

test('generateRoomId - produces non-empty human-friendly room slug', () => {
  const id1 = generateRoomId();
  const id2 = generateRoomId();
  assert.match(id1, /^isl-[a-z]+-\d+$/);
  assert.match(id2, /^isl-[a-z]+-\d+$/);
  assert.notEqual(id1, id2);
});

test('extractRoomId - extracts room parameter accurately from query string (NETW-01)', () => {
  assert.equal(extractRoomId('?room=isl-sky-42'), 'isl-sky-42');
  assert.equal(extractRoomId('room=test-room-99'), 'test-room-99');
  assert.equal(extractRoomId('?other=123&room=cedar-room-10&role=signer'), 'cedar-room-10');
  assert.equal(extractRoomId('?room=INVALID*CHAR$'), '');
  assert.equal(extractRoomId(''), '');
});

test('getRoomChannel - returns operational channel object with broadcast and presence interface', async () => {
  const roomChannel = getRoomChannel('test-channel-101');
  assert.ok(roomChannel);
  assert.equal(typeof roomChannel.sendBroadcast, 'function');
  assert.equal(typeof roomChannel.trackPresence, 'function');
  assert.equal(typeof roomChannel.onBroadcast, 'function');
  assert.equal(typeof roomChannel.onPresenceSync, 'function');
  assert.equal(typeof roomChannel.subscribe, 'function');
  assert.equal(typeof roomChannel.unsubscribe, 'function');

  // Verify broadcast invocation
  const res = await roomChannel.sendBroadcast('test_event', { hello: 'world' });
  assert.ok(res);

  roomChannel.unsubscribe();
});
