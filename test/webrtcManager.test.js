import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebRTCManager, STUN_SERVERS } from '../src/network/webrtcManager.js';

test('WebRTCManager - defines public STUN ice servers', () => {
  assert.ok(Array.isArray(STUN_SERVERS));
  assert.ok(STUN_SERVERS.length >= 2);
  assert.ok(STUN_SERVERS.some(s => s.urls.includes('cloudflare.com')));
  assert.ok(STUN_SERVERS.some(s => s.urls.includes('google.com')));
});

test('WebRTCManager - triggers onFallbackTrigger when dataChannel is not open (NETW-03)', () => {
  let fallbackPacket = null;

  const manager = new WebRTCManager({
    onFallbackTrigger: (packet) => {
      fallbackPacket = packet;
    }
  });

  const res = manager.sendMessage({ type: 'TEST', content: 'hello' });
  assert.equal(res.transport, 'broadcast-fallback');
  assert.ok(fallbackPacket);
  assert.equal(fallbackPacket.type, 'TEST');
  assert.equal(fallbackPacket.content, 'hello');
});

test('WebRTCManager - formats live partial signing packet properly (NETW-04)', () => {
  let capturedPacket = null;

  const manager = new WebRTCManager({
    onFallbackTrigger: (packet) => {
      capturedPacket = packet;
    }
  });

  manager.sendPartialSigning({
    glosses: ['YOU', 'NAME', 'WHAT'],
    previewText: 'What is your name?',
    sender: 'Aarav'
  });

  assert.ok(capturedPacket);
  assert.equal(capturedPacket.type, 'PARTIAL_SIGNING');
  assert.deepEqual(capturedPacket.glosses, ['YOU', 'NAME', 'WHAT']);
  assert.equal(capturedPacket.previewText, 'What is your name?');
  assert.equal(capturedPacket.sender, 'Aarav');
  assert.ok(typeof capturedPacket.timestamp === 'number');
});

test('WebRTCManager - formats committed sentence and text reply packets correctly', () => {
  const sentPackets = [];

  const manager = new WebRTCManager({
    onFallbackTrigger: (p) => sentPackets.push(p)
  });

  manager.sendCommittedSentence({
    id: 'msg_1',
    glosses: ['HELLO'],
    text: 'Hello!',
    sender: 'Aarav'
  });

  manager.sendTextReply({
    id: 'reply_1',
    text: 'Hello Aarav, nice to meet you!',
    sender: 'Priya'
  });

  assert.equal(sentPackets.length, 2);
  assert.equal(sentPackets[0].type, 'COMMITTED_MESSAGE');
  assert.equal(sentPackets[0].senderRole, 'signer');
  assert.equal(sentPackets[0].text, 'Hello!');

  assert.equal(sentPackets[1].type, 'TEXT_REPLY');
  assert.equal(sentPackets[1].senderRole, 'text_partner');
  assert.equal(sentPackets[1].text, 'Hello Aarav, nice to meet you!');
});
