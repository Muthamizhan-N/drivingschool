import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Clock, Star, ArrowRight, Sun, Moon, CheckCircle } from 'lucide-react';

export default function LandingPage({ darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              A
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              AutoDrive Academy
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
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent -z-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              <Award className="w-3.5 h-3.5" /> Certified Driving School
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              Master the Road with <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Confidence</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
              Learn to drive safely and efficiently under the guidance of certified trainers. We offer flexible batches, state-of-the-art dashboard tracking, and comprehensive on-road practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 flex items-center justify-center gap-2 transition"
              >
                Start Registration <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center transition"
              >
                Learn More
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-300" />
              <img 
                src="/driving_school_car.png" 
                alt="Driving School Training Car" 
                className="relative rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 object-cover w-full h-[320px] transform hover:scale-[1.01] transition duration-300"
              />
            </div>
            
            {/* Overlay Glass Card badge */}
            <div className="absolute -bottom-6 -right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">AD</div>
              <div>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Dual Control Cars</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">100% Certified Safety</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Core Features */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Why Choose AutoDrive Academy?</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We provide a digital-first approach to driving school operations, putting tracking and safety directly in your hands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Comprehensive Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                Dual-controlled cars, liability insurance, and certified safety instructors ensure a stress-free learning environment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Flexible Batch Timings</h3>
              <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                Choose between Morning (08:00 AM - 10:00 AM) or Evening (05:00 PM - 07:00 PM) batches to accommodate your daily routine.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Digital Portal Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                Access your personalized profile to track daily attendance, view trainers, check schedule timelines, and receive instant announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities / Simulator Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-250 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative flex justify-center order-last lg:order-first">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-indigo-500 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition duration-300" />
              <img 
                src="/driving_school_lobby.png" 
                alt="Driving School Facilities & Simulator" 
                className="relative rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 object-cover w-full h-[280px]"
              />
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              State-of-the-Art <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Training Facility</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
              We believe in combining standard on-road practice with modern classroom technologies. Our training facility includes a fully-equipped lobby and a premium 3D driving simulator station featuring responsive triple screens, authentic steering controls, and gear shift modules.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2 text-left">
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Triple Screen Simulators</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Practice complex slope starts and night simulation safely.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Dedicated Classroom Labs</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Learn road signs, defensive driving theories, and traffic rules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Training Programs</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Clear pricing tailored to your skill level. All packages include digital registration and log tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
            {/* Package 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-500 dark:text-slate-450">Starter Drive</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Perfect for absolute beginners</p>
                </div>
                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold">$300</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">/ 10 Days</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Basic Controls & Steering
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> 1-on-1 Dedicated Trainer
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Digital Portal Access
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 block w-full text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition">
                Register Now
              </Link>
            </div>

            {/* Package 2 - Preferred */}
            <div className="bg-indigo-950 dark:bg-slate-900 p-8 rounded-3xl border-2 border-indigo-500 flex flex-col justify-between shadow-xl text-white relative">
              <div className="absolute top-4 right-4 bg-indigo-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                POPULAR
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-indigo-300">Ultimate License</h4>
                  <p className="text-sm text-indigo-200/70">Complete course from zero to hero</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$500</span>
                  <span className="text-sm text-indigo-200/70">/ 15 Days</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-indigo-200/90">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Everything in Starter package
                  </li>
                  <li className="flex items-center gap-2 text-indigo-200/90">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Parking & Reverse Masterclasses
                  </li>
                  <li className="flex items-center gap-2 text-indigo-200/90">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Slope Starts & Traffic Simulator
                  </li>
                  <li className="flex items-center gap-2 text-indigo-200/90">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> License Exam Assistance
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 block w-full text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition">
                Register Now
              </Link>
            </div>

            {/* Package 3 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-500 dark:text-slate-450">Pro Driver</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Advanced highway and night drive</p>
                </div>
                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold">$750</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">/ 20 Days</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Everything in Ultimate package
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Real Highway Driving Sessions
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Rain & Night Driving Simulator
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 block w-full text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© 2026 AutoDrive Academy Driving School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
