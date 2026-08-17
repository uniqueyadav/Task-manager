import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradient Glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10 space-y-8">
        {/* Animated 404 Header */}
        <div className="relative inline-block">
          <h1 className="text-8xl sm:text-9xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-pulse select-none">
            404
          </h1>
          <span className="absolute -top-2 -right-4 bg-purple-500/20 text-purple-300 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-md">
            Page Not Found
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Looks like you're lost.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Back to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700 transition-all duration-300 backdrop-blur-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;