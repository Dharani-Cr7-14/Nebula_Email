import { Mail, CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
  onLogin: () => void;
  error?: string | null;
}

const Login = ({ onLogin, error }: Props) => {
  return (
    <div className="relative min-h-screen bg-[#f4f3f8] flex items-center justify-center px-4 py-12 overflow-hidden font-sans">

      {/* Soft background glow circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-indigo-200/30 blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-purple-100/20 blur-[120px]" />
      </div>

      {/* Main two-column card */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/10">

        {/* ── LEFT: Branding panel ─────────────────────────────── */}
        <div className="lg:w-[52%] bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 p-10 lg:p-14 flex flex-col justify-between text-white">

          {/* Logo + name */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white/90">NebulaMail AI</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Your intelligent<br />workspace for email.
            </h1>
            <p className="text-violet-200 text-sm leading-relaxed mb-10 max-w-sm">
              Manage your inbox, compose replies, and search your mail — all through natural language, powered by Google Gemini.
            </p>

            {/* Feature points */}
            <ul className="flex flex-col gap-4">
              {[
                'Connect your real Gmail inbox',
                'Control email with AI commands',
                'Search, reply and send faster',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-violet-300 mt-0.5 shrink-0" />
                  <span className="text-sm text-violet-100">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom badge */}
          <div className="mt-12 flex items-center gap-2 text-violet-300/70 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini · Gmail API</span>
          </div>
        </div>

        {/* ── RIGHT: Login card ────────────────────────────────── */}
        <div className="lg:w-[48%] bg-white p-8 lg:p-12 flex flex-col justify-center">

          {/* Card header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5 shadow-sm">
              <Mail className="w-7 h-7 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="text-sm text-slate-500">AI-powered email workspace</p>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-100 mb-7" />

          {/* Google button */}
          <button
            id="google-login-btn"
            onClick={onLogin}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-all duration-150 active:scale-[0.99]"
          >
            {/* Official Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sub-text */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Securely connect your Google account
          </p>

          {/* Divider */}
          <div className="border-t border-slate-100 mt-7 mb-5" />

          {/* Privacy note */}
          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            Your Gmail data stays connected to your Google account.{' '}
            NebulaMail AI uses Google OAuth to securely access only the permissions you approve.
          </p>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-300 mt-8">
            © 2026 NebulaMail AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
