import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores";
import { LoadingSpinner, SplashScreen } from "../../components/shared";

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
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
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
          <h1 className="text-2xl font-bold text-slate-900">TradeFlow Nepal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Import/Export Business Management
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
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
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          {hasAccount && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Need to create an account? Sign up"}
              </button>
              
              <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest px-2">OR</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <button
                onClick={enterDemoMode}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
                type="button"
              >
                View Live Demo →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
