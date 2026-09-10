import React from 'react';
import { 
  Bot, 
  Key, 
  Sparkles, 
  Edit3, 
  Copy, 
  Zap, 
  MessageSquare, 
  Globe, 
  Check 
} from 'lucide-react';

const AssistantDetails = ({ 
  user, 
  formData, 
  CLIENT_URL, 
  embedCode, 
  copiedSnippet, 
  copyToClipboard, 
  setIsEditing 
}) => {
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

  return (
    <div className="min-h-screen bg-[#f0f3f9] text-slate-800 p-4 sm:p-8 font-sans flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.assistantName || formData.assistantName}</h1>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  planType === 'Pro' 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-slate-200 text-slate-700 border-slate-300'
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
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:bg-indigo-700 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Agent Config</span>
          </button>
        </div>

        {/* Quick Metrics & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Gemini API Status */}
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
            <p className="text-[11px] font-medium text-slate-500">
              {user?.geminiApiKey ? 'Using custom Gemini API credentials.' : 'Using shared system key quotas.'}
            </p>
          </div>

          {/* Messages Remaining Metric */}
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
            
            {/* Custom Usage Bar or Pro Info */}
            {isProPlan ? (
              <div className="text-[10px] font-bold text-emerald-600 pt-2">
                ✓ Valid for {daysRemainingInPlan && daysRemainingInPlan > 0 ? daysRemainingInPlan : 0} more days
              </div>
            ) : (
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                <div 
                  className={`h-full transition-all duration-300 ${usagePercentage > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Active Tier Callout */}
          <div className={`p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 space-y-2 ${isProPlan ? 'ring-2 ring-emerald-300' : ''}`}>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-black uppercase tracking-wider">Current Tier</span>
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900 pt-1">
              {planType} Plan
            </div>
            {isProPlan ? (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-emerald-600">
                  ✓ Unlimited messages & premium features
                </p>
                {daysRemainingInPlan && daysRemainingInPlan > 0 ? (
                  <p className="text-[10px] font-medium text-emerald-500">
                    Valid for {daysRemainingInPlan} more days
                  </p>
                ) : (
                  <p className="text-[10px] font-medium text-amber-600">
                    Plan expires soon. Renew to maintain access.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] font-bold text-indigo-600 cursor-pointer hover:underline">
                Upgrade to Pro for unlimited usage & custom domain branding →
              </p>
            )}
          </div>

        </div>

        {/* Details & Embed Script Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Box: Active Agent Configuration */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 space-y-5">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Persona Overview
            </h2>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-[10px] font-black text-slate-400 uppercase">Tone Theme</span>
                <p className="text-xs font-extrabold text-indigo-600 capitalize mt-1">{formData.tone}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-[10px] font-black text-slate-400 uppercase">UI Theme</span>
                <p className="text-xs font-extrabold text-indigo-600 capitalize mt-1">{formData.theme}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold text-slate-600">Business Description</span>
              <p className="text-xs font-medium text-slate-600 leading-relaxed p-4 rounded-2xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                {formData.businessDescription || 'No business description provided yet.'}
              </p>
            </div>

            {/* Mapped Page Routes Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-slate-600 flex items-center justify-between">
                <span>Mapped Routes</span>
                <span className="text-indigo-600">{formData.pages.length} Configured</span>
              </span>
              
              {formData.pages.length === 0 ? (
                <p className="text-xs italic text-slate-400 py-2">No custom page paths linked.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.pages.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#f0f3f9] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {p.path}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Box: HTML Script Embed Generator */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">Where to paste this script?</h3>
              <p className="text-xs font-medium text-slate-500">
                Paste this script before the closing <code className="text-indigo-600 font-mono">&lt;/body&gt;</code> tag of your website HTML file.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-600">Example:</span>
              <pre className="mt-3 bg-[#0b1020] text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto shadow-inner leading-relaxed">
{`<body>
  Your Website Content
  <script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>
</body>`}
              </pre>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-slate-800">Embed Code</h3>
              <div className="flex items-center justify-between bg-[#0b1020] rounded-xl p-3 shadow-inner">
                <pre className="text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all pr-4">
                  {embedCode}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 cursor-pointer shadow-sm"
                  title="Copy Embed Script"
                >
                  {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AssistantDetails;