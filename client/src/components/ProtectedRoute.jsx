import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";

const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f3f9] flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500 selection:text-white">
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 min-w-[260px]">
          
          {/* Animated Spinner Icon Container */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#f0f3f9] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            
            {/* Floating Sparkle Accent */}
            <div className="absolute -top-1 -right-1 p-1 rounded-lg bg-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            </div>
          </div>

          {/* Loading Indicator Text */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Verifying Access
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1">
              <span>Authenticating session</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" style={{ animationDelay: '200ms' }} />
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" style={{ animationDelay: '400ms' }} />
              </span>
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;