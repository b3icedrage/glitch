import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  GitCommit,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Clock,
  ExternalLink,
  Terminal,
  Plus
} from 'lucide-react';

interface GitCommitItem {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface GitStatusFile {
  status: string;
  path: string;
}

interface GitStatusData {
  branch: string;
  remoteUrl: string;
  clean: boolean;
  files: GitStatusFile[];
  commits: GitCommitItem[];
}

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState<GitStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [touchChangelog, setTouchChangelog] = useState(false);
  const [resultBanner, setResultBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  const fetchGitStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/git/status');
      const data = await res.json();
      if (data.success) {
        setStatusData(data);
      } else {
        setResultBanner({ type: 'error', text: data.error || 'Failed to read git status' });
      }
    } catch (err: any) {
      setResultBanner({ type: 'error', text: err.message || 'Network error fetching git status' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setResultBanner(null);
      setCommandOutput(null);
      fetchGitStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommitAndPush = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = commitMessage.trim() || `chore: sync Glitch platform updates (${new Date().toISOString().slice(0, 19).replace('T', ' ')})`;
    try {
      setPushing(true);
      setResultBanner(null);
      setCommandOutput(null);

      const res = await fetch('/api/git/commit-and-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          touchChangelog,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to commit and push changes');
      }

      setCommitMessage('');
      setTouchChangelog(false);
      setResultBanner({
        type: 'success',
        text: data.summary || 'Committed and pushed to origin/main!',
      });
      if (data.output) {
        setCommandOutput(data.output);
      }
      await fetchGitStatus();
    } catch (err: any) {
      setResultBanner({
        type: 'error',
        text: err.message || 'Commit & push failed',
      });
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async () => {
    try {
      setPulling(true);
      setResultBanner(null);
      const res = await fetch('/api/git/pull', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Git pull failed');
      }
      setResultBanner({
        type: 'success',
        text: 'Pulled latest changes from origin/main',
      });
      if (data.output) {
        setCommandOutput(data.output);
      }
      await fetchGitStatus();
    } catch (err: any) {
      setResultBanner({
        type: 'error',
        text: err.message || 'Failed to pull from remote',
      });
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">GitHub Repository Sync</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  {statusData?.branch || 'main'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <span>{statusData?.remoteUrl || 'https://github.com/b3icedrage/glitch.git'}</span>
                <a
                  href="https://github.com/b3icedrage/glitch"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchGitStatus}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh Git Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {resultBanner && (
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-mono ${
                resultBanner.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/50 border-red-500/40 text-red-200'
              }`}
            >
              {resultBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 break-all">{resultBanner.text}</div>
            </div>
          )}

          {/* Commit & Push Form */}
          <form onSubmit={handleCommitAndPush} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4" />
                <span>Stage, Commit & Push to Origin</span>
              </label>
              <button
                type="button"
                onClick={handlePull}
                disabled={pulling || pushing}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${pulling ? 'animate-spin' : ''}`} />
                <span>{pulling ? 'Pulling...' : 'git pull'}</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat: update Glitch platform components..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={touchChangelog}
                  onChange={(e) => setTouchChangelog(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Append timestamp entry to READMEsync log if working tree is clean</span>
              </label>

              <button
                type="submit"
                disabled={pushing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
              >
                {pushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Pushing to GitHub...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Commit & Push</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Working Tree Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Working Tree Status</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {statusData?.files?.length
                  ? `${statusData.files.length} changed file(s)`
                  : 'Clean working tree'}
              </span>
            </div>

            {statusData?.files && statusData.files.length > 0 ? (
              <div className="divide-y divide-slate-800/60 max-h-36 overflow-y-auto text-xs font-mono">
                {statusData.files.map((f, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-slate-200 truncate">{f.path}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px]">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono py-1">
                All tracked files are up to date with <span className="text-emerald-400">origin/{statusData?.branch || 'main'}</span>. Check the box above to push a sync log commit anytime.
              </p>
            )}
          </div>

          {/* Terminal Output if available */}
          {commandOutput && (
            <div className="rounded-xl border border-slate-800 bg-black/80 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Git Output</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {commandOutput}
              </pre>
            </div>
          )}

          {/* Recent Commits */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recent Commits ({statusData?.branch || 'main'})</span>
            </h3>

            <div className="divide-y divide-slate-800/70">
              {(statusData?.commits || []).map((c) => (
                <div key={c.hash} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{c.message}</p>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{c.author}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.date}
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-[11px] shrink-0">
                    {c.hash}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between shrink-0">
          <span>Remote: github.com/b3icedrage/glitch.git</span>
          <span className="text-emerald-400">Authenticated · Push Ready</span>
        </div>
      </div>
    </div>
  );
};
