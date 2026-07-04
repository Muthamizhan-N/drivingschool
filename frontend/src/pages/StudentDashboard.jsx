import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Landmark, MessageSquare, Award, AlertCircle, LogOut, Sun, Moon, 
  Download, Clock, Phone, Mail, MapPin, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { getStudentDashboard, changePassword } from '../services/api';

export default function StudentDashboard({ darkMode, setDarkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Settings Password Form State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ success: null, error: null });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ success: null, error: "New passwords do not match" });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus({ success: null, error: null });
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordStatus({ success: "Password changed successfully!", error: null });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setPasswordStatus({ success: null, error: err.response?.data?.error || "Password update failed." });
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    async function loadStudentData() {
      try {
        const result = await getStudentDashboard();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDownloadDetails = () => {
    if (!data) return;
    const { profile, payment } = data;
    const receiptText = `
==================================================
        AUTODRIVE ACADEMY - REGISTRATION CARD
==================================================
Student Name:      ${profile.full_name}
Date of Birth:     ${profile.dob}
Email Address:     ${profile.email}
Phone Number:      ${profile.phone}
Address:           ${profile.address}
License Status:    ${profile.license_status.toUpperCase()}
Emergency Contact: ${profile.emergency_contact}
Preferred Batch:   ${profile.batch_details?.name || 'N/A'}
Registration Date: ${new Date(profile.registration_date).toLocaleDateString()}
Status:            ${profile.status.toUpperCase()}

------------------ TUITION RECEIPT ----------------
Total Fee Due:     $${payment.amount_due}
Total Fee Paid:    $${payment.amount_paid}
Balance Remaining: $${payment.balance}
Payment Status:    ${payment.status}

Thank you for choosing AutoDrive Academy.
==================================================
`;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AutoDrive_Registration_${profile.full_name.replace(' ', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
        Loading student portal...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold">Failed to load portal</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We couldn't load your student profile. Please make sure your registration is approved.
          </p>
          <button onClick={handleLogout} className="py-2 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-xl">
            Go back to Login
          </button>
        </div>
      </div>
    );
  }

  const { profile, progress, payment, schedule, announcements } = data;

  // Gauge details
  const radius = 50;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-b border-slate-200 dark:border-slate-800 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold">
              A
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              AutoDrive Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-rose-500"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold">Welcome back, {profile.full_name}!</h1>
            <p className="text-xs text-slate-400">
              Preferred Batch: <span className="font-bold text-indigo-500">{profile.batch_details?.name || 'Unassigned'}</span>
            </p>
          </div>

          <button
            onClick={handleDownloadDetails}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Download Registration ID Card
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Progress Circular Gauge */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm md:col-span-4 flex flex-col items-center text-center space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Attendance Progression</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-95">
                {/* Background track */}
                <circle
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* Foreground progression */}
                <circle
                  stroke="#6366f1"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{progress.percentage}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Sessions Completed</span>
              </div>
            </div>
            
            <div className="text-sm">
              <p className="font-bold">Day {progress.completed} of {progress.total} sessions finished</p>
              <p className="text-xs text-slate-455">15 days of mandatory attendance required for license endorsement.</p>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm md:col-span-8 space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Training Schedule</h3>
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 pt-2">
              {schedule.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Bullet */}
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border border-white dark:border-slate-900" />
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-indigo-500 font-mono uppercase">{item.day}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                        <Clock className="w-3 h-3" /> {item.time}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{item.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-12 gap-8">
          
          <div className="md:col-span-4 space-y-8">
            {/* Billing Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Tuition Billing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-455">Course Fee (15 Sessions)</span>
                    <span className="font-semibold">${payment.amount_due}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-455">Amount Paid</span>
                    <span className="font-semibold text-emerald-500">${payment.amount_paid}</span>
                  </div>
                  <div className="flex justify-between font-bold text-md pt-2">
                    <span>Balance Remaining</span>
                    <span className={payment.balance > 0 ? "text-indigo-500" : "text-emerald-500"}>
                      ${payment.balance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">Status: {payment.status}</p>
                  <p className="text-slate-455">Tuition must be cleared before the road test endorsement.</p>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Change Password</h3>
                <p className="text-[10px] text-slate-400">Update your account password below.</p>
              </div>

              {passwordStatus.success && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {passwordStatus.success}
                </div>
              )}

              {passwordStatus.error && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-[10px] text-rose-600 dark:text-rose-455 font-semibold">
                  {passwordStatus.error}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="py-2 px-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow transition duration-200"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Announcements & Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm md:col-span-8 space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">School Bulletins & Announcements</h3>
            
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No active announcements for your batch.</div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{ann.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{ann.content}</p>
                    <div className="text-[10px] text-slate-400 italic">Posted by {ann.sender_name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
