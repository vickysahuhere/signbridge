import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Camera,
  X,
  Check,
  Copy,
  ExternalLink,
  Download,
  AlertCircle,
  Bug,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Monitor,
  PenTool,
  Trash2,
  Eye,
  FileText,
  Send,
  CheckCircle2,
  Inbox,
  Mail,
  Hand,
  BookOpen,
  Phone,
  Palette,
  Lightbulb
} from 'lucide-react';
import {
  FEEDBACK_CATEGORIES,
  DEVELOPER_FEEDBACK_EMAIL,
  collectDiagnostics,
  saveFeedbackReport,
  getFeedbackReports,
  deleteFeedbackReport,
  clearAllFeedbackReports,
  generateMarkdownReport,
  generateEmailFeedbackUrl,
  generateGitHubIssueUrl,
  downloadReportAsJSON,
  downloadScreenshotImage
} from '../utils/feedbackManager.js';
import { captureDOMScreenshot, captureNativeWindowScreenshot } from '../utils/screenshotCapture.js';

export function FeedbackModal({
  isOpen,
  onClose,
  initialScreenshot = null,
  contextData = {}
}) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [category, setCategory] = useState('recognition');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [screenshot, setScreenshot] = useState(initialScreenshot);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [zoomScreenshot, setZoomScreenshot] = useState(false);

  // Annotation drawing state
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [drawColor, setDrawColor] = useState('#FF4B4B'); // coral red default
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Update screenshot if initialScreenshot changes
  useEffect(() => {
    if (initialScreenshot) {
      setScreenshot(initialScreenshot);
    }
  }, [initialScreenshot]);

  // Load saved history whenever opening history tab or modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedReports(getFeedbackReports());
    }
  }, [isOpen, activeTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (zoomScreenshot) {
          setZoomScreenshot(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomScreenshot, onClose]);

  // Initialize annotation canvas when toggled
  useEffect(() => {
    if (!isAnnotating || !canvasRef.current || !screenshot) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = screenshot;
  }, [isAnnotating, screenshot]);

  const handleRetakeDOMScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Temporarily wait a tick
      const dataUrl = await captureDOMScreenshot();
      setScreenshot(dataUrl);
      setIncludeScreenshot(true);
      setIsAnnotating(false);
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleNativeScreenGrab = async () => {
    setIsCapturing(true);
    try {
      const dataUrl = await captureNativeWindowScreenshot();
      setScreenshot(dataUrl);
      setIncludeScreenshot(true);
      setIsAnnotating(false);
    } catch (err) {
      if (err.name !== 'AbortError' && !err.message?.includes('cancel')) {
        alert('Native screen grab failed: ' + (err.message || err));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Drawing handlers for annotation canvas
  const startDrawing = (e) => {
    if (!isAnnotating || !canvasRef.current) return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = Math.max(4, canvas.width / 250);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isAnnotating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    // Commit canvas drawings to screenshot dataUrl
    try {
      const updatedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      setScreenshot(updatedDataUrl);
    } catch (err) {
      console.warn('Could not save annotated canvas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && !title.trim()) {
      alert('Please describe the issue in words so we understand what happened.');
      return;
    }

    setIsSubmitting(true);
    try {
      const diagnostics = includeDiagnostics ? collectDiagnostics(contextData) : {};
      const report = await saveFeedbackReport({
        category,
        title: title.trim() || `${FEEDBACK_CATEGORIES.find(c => c.id === category)?.label || 'Issue'} Report`,
        description: description.trim(),
        contact: contact.trim(),
        diagnostics,
        screenshot: includeScreenshot ? screenshot : null
      });

      setSubmittedReport(report);
      setSavedReports(getFeedbackReports());
    } catch (err) {
      alert('Failed to save report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMarkdown = (reportToCopy) => {
    const text = generateMarkdownReport(reportToCopy || submittedReport);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setSubmittedReport(null);
    setTitle('');
    setDescription('');
    setIsAnnotating(false);
  };

  const handleDeleteHistory = (id) => {
    deleteFeedbackReport(id);
    setSavedReports(getFeedbackReports());
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored local issue reports?')) {
      clearAllFeedbackReports();
      setSavedReports([]);
    }
  };

  if (!isOpen) return null;

  const currentDiagnostics = collectDiagnostics(contextData);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/70 backdrop-blur-sm select-none"
      data-feedback-modal="true"
      role="dialog"
      aria-modal="true"
      aria-label="Report Issue and Feedback Dialog"
    >
      <div className="cartoon-card w-full max-w-2xl flex flex-col shadow-cartoon-lg bg-white overflow-hidden h-[95dvh] sm:h-auto sm:max-h-[92vh] rounded-t-2xl sm:rounded-2xl animate-in fade-in zoom-in-95 duration-150 border-2 border-zinc-900">
        
        {/* Title Bar */}
        <div className="px-4 py-3 bg-[#EAF6E8] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF4B4B] border-2 border-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <Bug className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900 leading-tight">
                Report Issue &amp; Feedback
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Window screenshot &amp; edge diagnostics attached automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="px-4 pt-2.5 flex items-center justify-between border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('new');
                if (submittedReport) resetForm();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                  : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                  : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Saved Reports</span>
              {savedReports.length > 0 && (
                <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white">
                  {savedReports.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'history' && savedReports.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1"
              title="Delete all saved reports"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-5 bg-[#FAF8F5] text-zinc-900 text-xs overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: FORM OR SUBMITTED STATE */}
          {activeTab === 'new' && (
            <>
              {submittedReport ? (
                /* Post-Submission Success Screen */
                <div className="cartoon-card p-4 sm:p-6 bg-white space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#58CC02] border-2 border-zinc-900 text-white flex items-center justify-center mx-auto shadow-cartoon-sm">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-zinc-900">
                      Issue Report Saved Successfully!
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 max-w-md mx-auto">
                      Thank you! Your report has been recorded locally with your issue description, system diagnostics, and window screenshot.
                    </p>
                    <div className="inline-block mt-2 font-mono font-bold text-xs bg-zinc-100 border border-zinc-300 rounded-lg px-2.5 py-1 text-zinc-800">
                      Report ID: {submittedReport.id}
                    </div>
                  </div>

                  {/* Actions for User */}
                  <div className="pt-2 flex flex-col gap-2">
                    {/* Primary Action: Direct Email to Developer */}
                    <a
                      href={generateEmailFeedbackUrl(submittedReport)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cartoon-btn !py-2.5 !px-3 text-xs bg-[#58CC02] hover:bg-[#16A34A] text-white flex items-center justify-center gap-2 shadow-cartoon-sm font-black"
                      title={`Open pre-filled email addressed to ${DEVELOPER_FEEDBACK_EMAIL}`}
                    >
                      <Mail className="w-4 h-4 stroke-[2.5]" />
                      <span>Email to {DEVELOPER_FEEDBACK_EMAIL}</span>
                    </a>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                      {/* 1. Download File */}
                      <button
                        onClick={() => downloadReportAsJSON(submittedReport)}
                        className="cartoon-btn !py-2 !px-3 text-xs bg-white hover:bg-zinc-50 flex items-center justify-center gap-1.5"
                        title="Download JSON file with screenshot and diagnostics"
                      >
                        <Download className="w-3.5 h-3.5 text-zinc-800 stroke-[2.2]" />
                        <span>Download JSON</span>
                      </button>

                      {/* 2. Copy Markdown */}
                      <button
                        onClick={() => handleCopyMarkdown(submittedReport)}
                        className={`cartoon-btn !py-2 !px-3 text-xs flex items-center justify-center gap-1.5 ${
                          copied ? 'cartoon-btn-mint' : 'bg-white hover:bg-zinc-50'
                        }`}
                        title="Copy issue summary to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Copy Summary</span>
                          </>
                        )}
                      </button>

                      {/* 3. GitHub Issue */}
                      <a
                        href={generateGitHubIssueUrl(submittedReport)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cartoon-btn !py-2 !px-3 text-xs bg-[#FFC800] hover:bg-[#FFE082] flex items-center justify-center gap-1.5 text-zinc-900"
                        title="Open pre-filled GitHub issue"
                      >
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Open on GitHub</span>
                      </a>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="cartoon-btn !py-1 !px-3 text-xs bg-white hover:bg-zinc-100"
                    >
                      Submit Another Report
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="cartoon-btn cartoon-btn-primary !py-1 !px-4 text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Issue Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* 1. Category Selection Chips */}
                  <div>
                    <label className="block font-extrabold text-xs text-zinc-900 mb-1.5">
                      1. What type of issue are you facing?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {FEEDBACK_CATEGORIES.map((cat) => {
                        const isSelected = category === cat.id;
                        const CategoryIcon =
                          cat.id === 'recognition' ? Hand :
                          cat.id === 'translation' ? BookOpen :
                          cat.id === 'camera' ? Camera :
                          cat.id === 'call' ? Phone :
                          cat.id === 'ui' ? Palette : Lightbulb;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-2 rounded-xl border-2 text-left transition-all flex items-start gap-1.5 ${
                              isSelected
                                ? 'bg-white border-zinc-900 shadow-cartoon-sm'
                                : 'bg-[#FAF8F5] border-zinc-300 hover:border-zinc-500 opacity-80'
                            }`}
                          >
                            <CategoryIcon className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                            <div className="min-w-0">
                              <div className="font-extrabold text-[11px] text-zinc-900 leading-tight truncate">
                                {cat.label}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Window Screenshot Section */}
                  <div className="cartoon-card p-3 bg-white space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-zinc-900">
                        <Camera className="w-4 h-4 text-[#1CB0F6] stroke-[2.2]" />
                        <span>2. Window Screenshot Snapshot</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeScreenshot}
                            onChange={(e) => setIncludeScreenshot(e.target.checked)}
                            className="rounded border-zinc-900"
                          />
                          <span>Attach to report</span>
                        </label>
                      </div>
                    </div>

                    {includeScreenshot ? (
                      <div className="space-y-2">
                        {screenshot ? (
                          <div className="relative border-2 border-zinc-900 rounded-xl overflow-hidden bg-zinc-950 group">
                            {isAnnotating ? (
                              <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-auto max-h-[220px] object-contain cursor-crosshair block mx-auto"
                                title="Click and drag to circle or mark the issue"
                              />
                            ) : (
                              <img
                                src={screenshot}
                                alt="Window snapshot preview"
                                className="w-full h-auto max-h-[200px] object-contain block mx-auto cursor-pointer"
                                onClick={() => setZoomScreenshot(true)}
                                title="Click to view full screenshot"
                              />
                            )}

                            {/* Overlay Controls */}
                            <div className="p-1.5 bg-zinc-900/90 text-white flex items-center justify-between gap-1 flex-wrap text-[10px]">
                              <span className="font-mono text-zinc-300 inline-flex items-center gap-1.5">
                                {isAnnotating ? (
                                  <>
                                    <PenTool className="w-3 h-3 text-amber-400" />
                                    <span>Drawing Mode: Circle the problem</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-3 h-3 text-blue-400" />
                                    <span>Window Screenshot Attached</span>
                                  </>
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                {isAnnotating ? (
                                  <>
                                    <div className="flex items-center gap-1 mr-1">
                                      {['#FF4B4B', '#FFC800', '#1CB0F6', '#58CC02'].map((color) => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => setDrawColor(color)}
                                          className={`w-3.5 h-3.5 rounded-full border ${
                                            drawColor === color ? 'scale-125 border-white' : 'border-zinc-700'
                                          }`}
                                          style={{ backgroundColor: color }}
                                          title={`Use color ${color}`}
                                        />
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setIsAnnotating(false)}
                                      className="px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
                                    >
                                      Done Drawing
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setIsAnnotating(true)}
                                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1"
                                      title="Draw or circle the bug on the screenshot"
                                    >
                                      <PenTool className="w-2.5 h-2.5" />
                                      <span>Mark / Draw</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadScreenshotImage(screenshot)}
                                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1"
                                      title="Download image only"
                                    >
                                      <Download className="w-2.5 h-2.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border-2 border-dashed border-zinc-300 text-center space-y-1">
                            <p className="font-bold text-zinc-600">No screenshot captured yet</p>
                          </div>
                        )}

                        {/* Re-capture Options */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={handleRetakeDOMScreenshot}
                            disabled={isCapturing}
                            className="cartoon-btn !py-1 !px-2 text-[11px] bg-white hover:bg-zinc-50 flex items-center gap-1"
                            title="Re-capture current app screen instantly"
                          >
                            <RefreshCw className={`w-3 h-3 ${isCapturing ? 'animate-spin' : ''}`} />
                            <span>Re-take Screen</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleNativeScreenGrab}
                            disabled={isCapturing}
                            className="cartoon-btn !py-1 !px-2 text-[11px] bg-white hover:bg-zinc-50 flex items-center gap-1"
                            title="Choose specific tab or browser window via native picker"
                          >
                            <Monitor className="w-3 h-3 text-zinc-700" />
                            <span>Capture Tab / Full Window</span>
                          </button>

                          {screenshot && (
                            <button
                              type="button"
                              onClick={() => setScreenshot(null)}
                              className="text-[11px] font-bold text-zinc-500 hover:text-red-600 px-1.5 py-1 ml-auto"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">
                        Screenshot will not be included with this report.
                      </p>
                    )}
                  </div>

                  {/* 3. Issue in Words (Required) */}
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="issue-title" className="block font-extrabold text-xs text-zinc-900 mb-1">
                        3. Issue Title / Summary
                      </label>
                      <input
                        id="issue-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. 'NAMASTE sign not recognizing in low light' or 'Grammar reordering question'"
                        className="w-full px-3 py-1.5 text-xs font-bold bg-white border-2 border-zinc-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-cartoon-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="issue-desc" className="block font-extrabold text-xs text-zinc-900">
                          Tell us what happened in words <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {description.length} chars
                        </span>
                      </div>
                      <textarea
                        id="issue-desc"
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe what you were doing:&#10;• What sign or feature were you using?&#10;• What did you expect to happen?&#10;• What went wrong or looked incorrect?"
                        className="w-full p-2.5 text-xs font-medium bg-white border-2 border-zinc-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-cartoon-sm leading-relaxed"
                      />
                    </div>

                    <div>
                      <label htmlFor="issue-contact" className="block font-bold text-[11px] text-zinc-700 mb-0.5">
                        Your Contact or Handle (Optional)
                      </label>
                      <input
                        id="issue-contact"
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Email address, Discord username, or GitHub @handle"
                        className="w-full px-3 py-1 text-xs font-medium bg-white border-2 border-zinc-300 rounded-xl focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Automated Diagnostics Accordion */}
                  <div className="border border-zinc-300 rounded-xl bg-white overflow-hidden">
                    <div className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50" onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}>
                      <label className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-900 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={includeDiagnostics}
                          onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                          className="rounded border-zinc-900"
                        />
                        <span>4. Include System Diagnostics</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                        className="text-zinc-500 hover:text-zinc-900 p-0.5"
                      >
                        {showDiagnosticsDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {showDiagnosticsDetail && (
                      <div className="p-3 bg-[#FAF8F5] border-t border-zinc-200 font-mono text-[10px] space-y-1 text-zinc-700">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div><span className="font-bold text-zinc-900">Page:</span> {currentDiagnostics.page}</div>
                          <div><span className="font-bold text-zinc-900">Mode:</span> {currentDiagnostics.recognitionMode}</div>
                          <div><span className="font-bold text-zinc-900">AI Worker:</span> {currentDiagnostics.workerStatus} ({currentDiagnostics.workerLatencyMs}ms)</div>
                          <div><span className="font-bold text-zinc-900">FPS:</span> {currentDiagnostics.fps}</div>
                          <div><span className="font-bold text-zinc-900">Motion:</span> {currentDiagnostics.motionState}</div>
                          <div><span className="font-bold text-zinc-900">Room / Transport:</span> {currentDiagnostics.roomId} ({currentDiagnostics.connectionMode})</div>
                          <div><span className="font-bold text-zinc-900">Viewport:</span> {currentDiagnostics.viewport}</div>
                          <div><span className="font-bold text-zinc-900">WebGL:</span> {currentDiagnostics.webgl}</div>
                        </div>
                        {currentDiagnostics.recentGlosses?.length > 0 && (
                          <div className="pt-1 border-t border-zinc-200">
                            <span className="font-bold text-zinc-900">Recent Signs:</span> {currentDiagnostics.recentGlosses.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-200 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={onClose}
                        className="cartoon-btn !py-1.5 !px-3 text-xs bg-white hover:bg-zinc-100"
                      >
                        Cancel
                      </button>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>Routes to: {DEVELOPER_FEEDBACK_EMAIL}</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cartoon-btn cartoon-btn-primary !py-1.5 !px-5 text-xs font-extrabold flex items-center gap-1.5 shadow-cartoon-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Report...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Submit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: LOCAL SAVED HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {savedReports.length === 0 ? (
                <div className="cartoon-card p-8 bg-white text-center space-y-2">
                  <Inbox className="w-10 h-10 text-zinc-300 mx-auto" />
                  <p className="font-bold text-xs text-zinc-700">No issue reports logged yet</p>
                  <p className="text-[11px] text-zinc-500">
                    Reports submitted on this browser are securely saved here with diagnostics and screenshots.
                  </p>
                </div>
              ) : (
                savedReports.map((report) => {
                  const cat = FEEDBACK_CATEGORIES.find(c => c.id === report.category);
                  return (
                    <div key={report.id} className="cartoon-card p-3 bg-white space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white font-mono">
                              {report.id}
                            </span>
                            <span className="font-extrabold text-xs text-zinc-900 truncate">
                              {cat?.icon} {report.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {new Date(report.timestamp).toLocaleString()} • {report.diagnostics?.page || 'general'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={generateEmailFeedbackUrl(report)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-emerald-50 text-[#16A34A]"
                            title={`Send to ${DEVELOPER_FEEDBACK_EMAIL}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => downloadReportAsJSON(report)}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-700"
                            title="Download JSON report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyMarkdown(report)}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-700"
                            title="Copy issue Markdown"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={generateGitHubIssueUrl(report)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-700"
                            title="Submit to GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteHistory(report.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-600"
                            title="Delete this report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description preview */}
                      <p className="text-xs text-zinc-700 line-clamp-2 bg-[#EAF6E8] p-2 rounded-lg border border-[#D6EBD3]">
                        {report.description}
                      </p>

                      {/* Thumbnail if present */}
                      {report.screenshot && (
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 font-mono">
                          <img
                            src={report.screenshot}
                            alt="Report thumbnail"
                            className="w-16 h-10 object-cover rounded border border-zinc-400 cursor-pointer"
                            onClick={() => {
                              setScreenshot(report.screenshot);
                              setZoomScreenshot(true);
                            }}
                          />
                          <span>Screenshot attached • Click to enlarge</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>

      {/* Fullscreen Zoomed Screenshot Lightbox */}
      {zoomScreenshot && screenshot && (
        <div
          className="fixed inset-0 z-60 bg-zinc-950/90 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomScreenshot(false)}
        >
          <div className="max-w-4xl max-h-[85vh] overflow-hidden border-2 border-white rounded-xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshot}
              alt="Full zoom screenshot"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-2 bg-zinc-900 text-white flex items-center justify-between text-xs">
              <span className="font-mono">Window Screenshot Preview</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadScreenshotImage(screenshot)}
                  className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScreenshot(false)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackModal;
