import { isSupabaseConfigured, supabase } from '../network/supabaseClient.js';

/**
 * feedbackManager.js
 * 
 * Manages client-side issue reporting and feedback collection for Sanket:
 * 1. Collects system diagnostics (FPS, worker status, page, recognition mode, browser, screen).
 * 2. Persists reports locally in localStorage ('sanket_feedback_reports').
 * 3. Supports Supabase upload when configured, with offline fallback.
 * 4. Generates formatted GitHub Issue URLs and Markdown reports.
 * 5. Exports JSON reports with embedded screenshot data.
 */

export const FEEDBACK_CATEGORIES = [
  { id: 'recognition', label: 'Sign Recognition', icon: '🖐️', desc: 'Signs not detected or inaccurate predictions' },
  { id: 'translation', label: 'Translation / Grammar', icon: '📖', desc: 'Grammar ordering (SOV to SVO) or sentence errors' },
  { id: 'camera', label: 'Camera / Biometrics', icon: '📹', desc: 'Webcam feed, landmark tracking or lighting issues' },
  { id: 'call', label: 'Call / WebRTC', icon: '📞', desc: 'Room joining, peer connection or audio/video call lag' },
  { id: 'ui', label: 'UI / Visual Glitch', icon: '🎨', desc: 'Layout overflow, broken styles or rendering bugs' },
  { id: 'other', label: 'General / Suggestion', icon: '💡', desc: 'Feature requests, feedback and ideas' }
];

const LOCAL_STORAGE_KEY = 'sanket_feedback_reports';
const MAX_STORED_REPORTS = 25;

/**
 * Collects an automated system diagnostic snapshot at the moment of issue reporting.
 */
export function collectDiagnostics(context = {}) {
  const isBrowser = typeof window !== 'undefined';
  const screenInfo = isBrowser && window.screen ? {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1
  } : {};

  const viewportInfo = isBrowser ? {
    width: window.innerWidth,
    height: window.innerHeight
  } : {};

  // Check WebGL / GPU support
  let webglSupport = 'unknown';
  if (isBrowser) {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      webglSupport = gl ? 'supported' : 'unsupported';
    } catch {
      webglSupport = 'error';
    }
  }

  return {
    appVersion: '0.1.0',
    timestamp: new Date().toISOString(),
    localTime: isBrowser ? new Date().toLocaleString() : '',
    page: context.currentPage || 'home',
    recognitionMode: context.recognitionMode || 'word',
    fps: Number(context.fps || 0),
    workerStatus: context.workerStatus || 'unknown',
    workerLatencyMs: Number(context.workerLatencyMs || 0),
    motionState: context.motionState?.state || 'IDLE',
    roomId: context.roomId || 'none',
    connectionMode: context.connectionMode || 'offline',
    rttMs: Number(context.rttMs || 0),
    recentGlosses: Array.isArray(context.recentGlosses) ? context.recentGlosses.slice(-10) : [],
    committedSentencesCount: Number(context.committedSentencesCount || 0),
    viewport: `${viewportInfo.width || 0}x${viewportInfo.height || 0} (scale: ${screenInfo.pixelRatio || 1})`,
    screen: `${screenInfo.width || 0}x${screenInfo.height || 0}`,
    webgl: webglSupport,
    userAgent: isBrowser ? navigator.userAgent : 'Node.js',
    language: isBrowser ? (navigator.language || 'en') : 'en',
    url: isBrowser ? window.location.href : '',
    online: isBrowser ? navigator.onLine : true
  };
}

/**
 * Generates a clean human-friendly report ID.
 * e.g. "FB-M8K2-7A4B"
 */
export function generateReportId() {
  const part1 = Date.now().toString(36).toUpperCase().slice(-4);
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FB-${part1}-${part2}`;
}

/**
 * Saves a new feedback report to localStorage and attempts Supabase upload.
 */
export async function saveFeedbackReport({
  category = 'other',
  title = '',
  description = '',
  contact = '',
  diagnostics = {},
  screenshot = null
}) {
  const reportId = generateReportId();
  const timestamp = new Date().toISOString();

  const report = {
    id: reportId,
    timestamp,
    category,
    title: (title || '').trim() || `Issue in ${category}`,
    description: (description || '').trim(),
    contact: (contact || '').trim(),
    diagnostics,
    screenshot // Data URL string or null
  };

  // 1. Save to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = getFeedbackReports();
      const updated = [report, ...existing.filter(r => r.id !== reportId)].slice(0, MAX_STORED_REPORTS);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[Feedback] Could not write report to localStorage:', e);
      // If localStorage is full due to large screenshot, retry without screenshot
      try {
        const existing = getFeedbackReports();
        const slimReport = { ...report, screenshot: null, screenshotOmitted: true };
        const updated = [slimReport, ...existing.filter(r => r.id !== reportId)].slice(0, MAX_STORED_REPORTS);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // storage completely blocked
      }
    }
  }

  // 2. Attempt Supabase upload if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('feedback_reports').insert([{
        id: report.id,
        category: report.category,
        title: report.title,
        description: report.description,
        contact: report.contact,
        diagnostics: report.diagnostics,
        has_screenshot: Boolean(report.screenshot),
        created_at: report.timestamp
      }]);
    } catch (err) {
      // Non-blocking: table might not exist in Supabase yet
      console.warn('[Feedback] Supabase feedback table upload skipped:', err?.message);
    }
  }

  return report;
}

/**
 * Retrieves stored feedback reports from localStorage.
 */
export function getFeedbackReports() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Deletes a stored feedback report by ID.
 */
export function deleteFeedbackReport(id) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const list = getFeedbackReports().filter(r => r.id !== id);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears all stored feedback reports.
 */
export function clearAllFeedbackReports() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Generates a clean Markdown report suitable for GitHub Issues or clipboard copying.
 */
export function generateMarkdownReport(report) {
  const d = report.diagnostics || {};
  const cat = FEEDBACK_CATEGORIES.find(c => c.id === report.category);
  const catLabel = cat ? `${cat.icon} ${cat.label}` : report.category;

  const glossesStr = Array.isArray(d.recentGlosses) && d.recentGlosses.length > 0
    ? d.recentGlosses.join(', ')
    : 'None';

  return `### 🐛 Issue Report: ${report.title}

**Report ID**: \`${report.id}\`  
**Category**: ${catLabel}  
**Reported At**: ${report.timestamp}  
${report.contact ? `**Contact**: \`${report.contact}\`  \n` : ''}

---

#### 📝 Issue Description
${report.description || '*(No description provided)*'}

---

#### ⚙️ System Diagnostics
| Property | Value |
| :--- | :--- |
| **Active Page** | \`${d.page || 'unknown'}\` |
| **Recognition Mode** | \`${d.recognitionMode || 'unknown'}\` |
| **AI Worker Status** | \`${d.workerStatus || 'unknown'}\` |
| **Inference Latency** | \`${d.workerLatencyMs ?? 0}ms\` |
| **FPS** | \`${d.fps ?? 0}\` |
| **Motion State** | \`${d.motionState || 'IDLE'}\` |
| **Recent Signs/Glosses** | \`${glossesStr}\` |
| **Room / Connection** | \`${d.roomId || 'none'}\` (${d.connectionMode || 'offline'}, ${d.rttMs ?? 0}ms RTT) |
| **Viewport & Screen** | \`${d.viewport || 'unknown'}\` (Screen: \`${d.screen || 'unknown'}\`) |
| **Browser / OS** | \`${d.userAgent || 'unknown'}\` |
| **WebGL Support** | \`${d.webgl || 'unknown'}\` |

---
*Generated automatically by Sanket ISL Edge AI Feedback System.*
${report.screenshot ? '\n*(Screenshot attached with report bundle)*\n' : ''}`;
}

export const DEVELOPER_FEEDBACK_EMAIL = 'vickyasadharan@gmail.com';

/**
 * Generates a pre-filled mailto URL addressed to the developer with the complete markdown report.
 */
export function generateEmailFeedbackUrl(report, email = DEVELOPER_FEEDBACK_EMAIL) {
  const subject = encodeURIComponent(`[Sanket Feedback] ${report.title || 'Issue Report'} (#${report.id})`);
  const bodyText = generateMarkdownReport(report);
  const body = encodeURIComponent(bodyText);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * Generates a pre-filled GitHub new issue URL.
 */
export function generateGitHubIssueUrl(report, repoUrl = 'https://github.com/vickysahuhere/signbridge') {
  const base = repoUrl.replace(/\/$/, '');
  const title = encodeURIComponent(`[Feedback] ${report.title}`);
  const bodyText = generateMarkdownReport(report);
  const body = encodeURIComponent(bodyText);
  return `${base}/issues/new?title=${title}&body=${body}`;
}

/**
 * Downloads a feedback report as a JSON file including diagnostics and screenshot.
 */
export function downloadReportAsJSON(report) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sanket-issue-${report.id.toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the screenshot image directly as JPEG.
 */
export function downloadScreenshotImage(screenshotDataUrl, filename = 'sanket-screenshot.jpg') {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !screenshotDataUrl) return;
  const a = document.createElement('a');
  a.href = screenshotDataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
