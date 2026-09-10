import React, { useState } from 'react';
import { Bot, Key, MessageSquare, Zap, Sparkles, Globe, Copy, Check, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const AssistantDetails = ({ user, formData, CLIENT_URL, onEdit }) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const planType = user?.plan || 'Free';
  
  // Plan-based message limits
  const isProPlan = planType === 'Pro' || planType === 'pro';
  const requestLimit = isProPlan ? 999999 : (user?.requestLimit && user.requestLimit > 0 ? user.requestLimit : 200);
  const totalMessages = user?.totalMessages || 0;
  const messagesLeft = isProPlan ? '∞' : Math.max(0, requestLimit - totalMessages);
  const usagePercentage = isProPlan ? 0 : Math.min(100, Math.round((totalMessages / requestLimit) * 100));
  
  // Pro plan expiry (1 month from plan start)
  const planStartDate = user?.planStartDate ? new Date(user.planStartDate) : null;
  const planExpiryDate = planStartDate ? new Date(planStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const daysRemainingInPlan = planExpiryDate ? Math.ceil((planExpiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const embedCode = `<script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedSnippet(true);
    toast.success("Embed snippet copied to clipboard!");
    setTimeout(() => setCopiedSnippet(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f0f3f9] text-slate-800 p-4 sm:p-8 font-sans flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.assistantName || formData.assistantName}</h1>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  planType === 'Pro' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {planType} Plan
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {user?.businessName || 'Configured Business'} • {user?.businessType || 'General Assistant'}
              </p>
            </div>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Agent Config</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-black uppercase tracking-wider">Gemini API Status</span>
              <Key className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className={`w-3 h-3 rounded-full ${user?.geminiApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-sm font-black text-slate-900">
                {user?.geminiApiKey ? 'Custom API Key Active' : 'Default Platform Key'}
              </span>
            </div>
          </div>

          <div className={`p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 space-y-2 ${isProPlan ? 'ring-2 ring-emerald-300' : ''}`}>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-black uppercase tracking-wider">Messages Remaining</span>
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              {isProPlan ? (
                <>
                  <span className="text-2xl font-black text-emerald-600">{messagesLeft}</span>
                  <span className="text-xs font-bold text-slate-400">Unlimited</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-slate-900">{messagesLeft}</span>
                  <span className="text-xs font-bold text-slate-400">/ 200 limit</span>
                </>
              )}
            </div>
            {isProPlan ? (
              <div className="text-[10px] font-bold text-emerald-600 pt-2">
                ✓ Valid for {daysRemainingInPlan && daysRemainingInPlan > 0 ? daysRemainingInPlan : 0} more days
              </div>
            ) : (
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                <div className={`h-full ${usagePercentage > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${usagePercentage}%` }} />
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-black uppercase tracking-wider">Current Tier</span>
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900 pt-1">{planType} Tier</div>
          </div>
        </div>

        {/* Persona Overview & Code Snippet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 space-y-5">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Persona Overview
            </h2>
            <p className="text-xs font-medium text-slate-600 leading-relaxed p-4 rounded-2xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
              {formData.businessDescription || 'No business description provided yet.'}
            </p>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Embed Code</h3>
            <div className="flex items-center justify-between bg-[#0b1020] rounded-xl p-3 shadow-inner">
              <pre className="text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all pr-4">{embedCode}</pre>
              <button onClick={copyToClipboard} className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0">
                {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantDetails;