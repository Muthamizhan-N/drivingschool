import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clipboard, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { registerPublic, getBatches } from '../services/api';

export default function RegistrationPage() {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    address: '',
    phone: '',
    email: '',
    license_status: 'none',
    preferred_batch: '',
    emergency_contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // DOB Parts state for dropdowns
  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });

  // Update formData.dob when dobParts change
  useEffect(() => {
    if (dobParts.day && dobParts.month && dobParts.year) {
      setFormData(prev => ({
        ...prev,
        dob: `${dobParts.year}-${dobParts.month}-${dobParts.day.padStart(2, '0')}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dob: ''
      }));
    }
  }, [dobParts]);

  useEffect(() => {
    async function loadBatches() {
      try {
        const data = await getBatches();
        setBatches(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, preferred_batch: data[0].id.toString() }));
        }
      } catch (err) {
        console.error("Failed to load batches", err);
        // Fallbacks for batches if offline
        const fallbackBatches = [
          { id: 1, name: 'Morning Batch (08:00 AM - 10:00 AM)' },
          { id: 2, name: 'Evening Batch (05:00 PM - 07:00 PM)' }
        ];
        setBatches(fallbackBatches);
        setFormData(prev => ({ ...prev, preferred_batch: '1' }));
      }
    }
    loadBatches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerPublic(formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed. Please double check all fields.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold">Application Submitted!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Thank you, <span className="font-semibold text-slate-900 dark:text-white">{formData.full_name}</span>. Your application is now <span className="text-amber-500 font-semibold">Pending Approval</span> by our school manager.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-left text-xs space-y-2 text-slate-500 dark:text-slate-450">
            <p className="font-semibold text-slate-700 dark:text-slate-350">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Manager reviews details & preferred batch.</li>
              <li>Once approved, unique Login Credentials will be generated automatically.</li>
              <li>You will receive your Login ID & Password via <b>SMS</b>, <b>WhatsApp</b>, and <b>Email</b>.</li>
            </ol>
          </div>
          <div className="pt-4 flex gap-4">
            <Link to="/" className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition">
              Back to Home
            </Link>
            <Link to="/login" className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-1 transition">
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-12 transition">
      <div className="max-w-2xl w-full space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">Student Registration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Submit your application to enroll. Fields marked with <span className="text-rose-500">*</span> are required.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex gap-3 text-sm text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Date of Birth Dropdowns */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                {/* Day Dropdown */}
                <select
                  required
                  value={dobParts.day}
                  onChange={(e) => setDobParts(prev => ({ ...prev, day: e.target.value }))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d.toString()}>{d}</option>
                  ))}
                </select>

                {/* Month Dropdown */}
                <select
                  required
                  value={dobParts.month}
                  onChange={(e) => setDobParts(prev => ({ ...prev, month: e.target.value }))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Month</option>
                  {[
                    { v: '01', l: 'Jan' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
                    { v: '04', l: 'Apr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
                    { v: '07', l: 'Jul' }, { v: '08', l: 'Aug' }, { v: '09', l: 'Sep' },
                    { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' }
                  ].map(m => (
                    <option key={m.v} value={m.v}>{m.l}</option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  required
                  value={dobParts.year}
                  onChange={(e) => setDobParts(prev => ({ ...prev, year: e.target.value }))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 80 }, (_, i) => 2011 - i).map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="johndoe@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Road Ave, Apt 4B, City, Country"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Preferred Batch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Preferred Batch <span className="text-rose-500">*</span>
              </label>
              <select
                name="preferred_batch"
                required
                value={formData.preferred_batch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* License Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                License Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="license_status"
                required
                value={formData.license_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                <option value="none">None (No License)</option>
                <option value="learner">Learner's License</option>
                <option value="full">Full License</option>
                <option value="expired">Expired License</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Emergency Contact (Name & Phone) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clipboard className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="emergency_contact"
                  required
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Jane Doe (+1 555-098-7654)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 py-3 px-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex justify-center items-center gap-2 transition duration-200"
            >
              {loading ? "Submitting Application..." : "Submit Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
