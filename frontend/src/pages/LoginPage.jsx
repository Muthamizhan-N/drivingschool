import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';
import { login } from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.non_field_errors?.[0] || err.message || "Invalid Username or Password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition">
      <div className="max-w-md w-full space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Portal Login</h2>
            <p className="text-sm text-slate-500 dark:text-slate-455">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex gap-3 text-sm text-rose-600 dark:text-rose-455">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Username / Login ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., admin or student username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex justify-center items-center gap-2 transition duration-200"
            >
              {loading ? "Authenticating..." : "Login to Portal"}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2 text-indigo-700 dark:text-indigo-300">
            <div className="flex items-center gap-1.5 font-bold">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <span>Demo Quick-Login Guides:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>Manager/Admin Role: Enter <b>admin</b> as username.</li>
              <li>Student Role: Register a student profile, log in as <b>admin</b> to approve, copy the generated credentials (e.g. <b>john.1</b>) and log in!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
