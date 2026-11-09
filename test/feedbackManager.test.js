import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectDiagnostics,
  generateReportId,
  saveFeedbackReport,
  getFeedbackReports,
  deleteFeedbackReport,
  clearAllFeedbackReports,
  generateMarkdownReport,
  generateGitHubIssueUrl,
  FEEDBACK_CATEGORIES
} from '../src/utils/feedbackManager.js';

test('FEEDBACK_CATEGORIES - provides structured issue categories', () => {
  assert.ok(Array.isArray(FEEDBACK_CATEGORIES));
  assert.ok(FEEDBACK_CATEGORIES.length >= 6);
  const ids = FEEDBACK_CATEGORIES.map(c => c.id);
  assert.ok(ids.includes('recognition'));
  assert.ok(ids.includes('translation'));
  assert.ok(ids.includes('camera'));
  assert.ok(ids.includes('call'));
  assert.ok(ids.includes('ui'));
  assert.ok(ids.includes('other'));
});

test('collectDiagnostics - extracts telemetry and system state', () => {
  const mockContext = {
    currentPage: 'learn',
    recognitionMode: 'alphabet',
    fps: 32,
    workerStatus: 'ready',
    workerLatencyMs: 14,
    motionState: { state: 'SIGNING_ACTIVE', pauseProgress: 0.4 },
    roomId: 'isl-sky-42',
    connectionMode: 'p2p',
    rttMs: 16,
    recentGlosses: ['A', 'B', 'C'],
    committedSentencesCount: 3
  };

  const diag = collectDiagnostics(mockContext);
  assert.equal(diag.page, 'learn');
  assert.equal(diag.recognitionMode, 'alphabet');
  assert.equal(diag.fps, 32);
  assert.equal(diag.workerStatus, 'ready');
  assert.equal(diag.workerLatencyMs, 14);
  assert.equal(diag.motionState, 'SIGNING_ACTIVE');
  assert.equal(diag.roomId, 'isl-sky-42');
  assert.equal(diag.connectionMode, 'p2p');
  assert.equal(diag.rttMs, 16);
  assert.deepEqual(diag.recentGlosses, ['A', 'B', 'C']);
  assert.equal(diag.committedSentencesCount, 3);
  assert.ok(diag.timestamp);
});

test('generateReportId - produces formatted alphanumeric report identifiers', () => {
  const id1 = generateReportId();
  const id2 = generateReportId();
  assert.match(id1, /^FB-[A-Z0-9]+-[A-Z0-9]+$/);
  assert.match(id2, /^FB-[A-Z0-9]+-[A-Z0-9]+$/);
  assert.notEqual(id1, id2);
});

test('generateMarkdownReport - creates comprehensive markdown report', () => {
  const mockReport = {
    id: 'FB-TEST-1234',
    timestamp: '2026-11-09T14:45:00.000Z',
    category: 'recognition',
    title: 'Namaste sign not recognized',
    description: 'When holding both hands up together, the sign did not register.',
    contact: 'tester@example.com',
    diagnostics: {
      page: 'chat',
      recognitionMode: 'word',
      workerStatus: 'ready',
      workerLatencyMs: 12,
      fps: 30,
      motionState: 'SIGNING_ACTIVE',
      recentGlosses: ['HELLO', 'NAMASTE'],
      roomId: 'isl-river-99',
      connectionMode: 'p2p',
      rttMs: 15,
      viewport: '1920x1080 (scale: 1)',
      screen: '1920x1080',
      userAgent: 'MockBrowser/1.0',
      webgl: 'supported'
    },
    screenshot: 'data:image/jpeg;base64,mockdata'
  };

  const md = generateMarkdownReport(mockReport);
  assert.ok(md.includes('FB-TEST-1234'));
  assert.ok(md.includes('Namaste sign not recognized'));
  assert.ok(md.includes('When holding both hands up together'));
  assert.ok(md.includes('tester@example.com'));
  assert.ok(md.includes('12ms'));
  assert.ok(md.includes('30'));
  assert.ok(md.includes('HELLO, NAMASTE'));
  assert.ok(md.includes('Screenshot attached'));
});

test('generateGitHubIssueUrl - encodes title and body into GitHub new issue link', () => {
  const mockReport = {
    id: 'FB-TEST-99',
    timestamp: '2026-11-09T14:45:00.000Z',
    category: 'ui',
    title: 'Broken modal border',
    description: 'Border is overflowing on mobile width',
    diagnostics: { page: 'home' }
  };

  const url = generateGitHubIssueUrl(mockReport, 'https://github.com/vicky-10/sanket');
  assert.ok(url.startsWith('https://github.com/vicky-10/sanket/issues/new?'));
  assert.ok(url.includes('title='));
  assert.ok(url.includes('body='));
  assert.ok(url.includes('Broken%20modal%20border') || url.includes('Broken+modal+border'));
});

test('saveFeedbackReport & storage operations - handles in-memory mock storage', async () => {
  // Mock localStorage for Node.js test environment
  const storageMap = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => storageMap.get(k) || null,
      setItem: (k, v) => storageMap.set(k, String(v)),
      removeItem: (k) => storageMap.delete(k)
    }
  };

  clearAllFeedbackReports();
  assert.equal(getFeedbackReports().length, 0);

  const report = await saveFeedbackReport({
    category: 'translation',
    title: 'Grammar SOV test',
    description: 'I_ME WATER WANT should format to I want water',
    diagnostics: { page: 'chat' }
  });

  assert.ok(report.id.startsWith('FB-'));
  assert.equal(report.title, 'Grammar SOV test');

  const list = getFeedbackReports();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, report.id);

  // Delete operation
  const deleted = deleteFeedbackReport(report.id);
  assert.equal(deleted, true);
  assert.equal(getFeedbackReports().length, 0);

  // Clean up global mock
  delete globalThis.window;
});
