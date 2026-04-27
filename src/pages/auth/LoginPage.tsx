import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores";
import { LoadingSpinner } from "../../components/shared";

export function LoginPage() {
  const { login, signup, isLoading, checkExistingAccount, enterDemoMode } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    checkExistingAccount().then((exists) => {
      setHasAccount(exists);
      setIsSignup(!exists);
    });
  }, [checkExistingAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  };

  if (hasAccount === null) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">TradeFlow</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">
            Import/Export Business Management
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            {isSignup ? "Create Account" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label htmlFor="company-name" className="label-text">
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-field"
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label htmlFor="owner-name" className="label-text">
                    Owner / Authorized Signatory
                  </label>
                  <input
                    id="owner-name"
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="input-field"
                    placeholder="Full Name"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="label-text">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@company.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="label-text">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              {isSignup && (
                <div>
                  <label htmlFor="confirm-password" className="label-text">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              {isSignup ? "Get Started" : "Enter Dashboard"}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            {hasAccount && (
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm font-bold text-blue-600 hover:text-blue-500 uppercase tracking-tight"
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Need to create an account? Sign up"}
              </button>
            )}
            
            <div className="flex items-center gap-2 w-full">
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest px-2 font-bold">OR</span>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
            </div>

            <button
              onClick={enterDemoMode}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors uppercase tracking-tight"
              type="button"
            >
              Explore Live Demo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
