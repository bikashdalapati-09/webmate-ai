import React, { useState } from 'react';
import axios from 'axios';
import { serverURL, CLIENT_URL } from "../App.jsx";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { 
  Bot, 
  Building2, 
  Key, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Palette, 
  Compass, 
  Save, 
  Loader2, 
  Check, 
  AlertCircle,
  ExternalLink,
  AlertTriangle,
  X,
  Edit3,
  Copy,
  Zap,
  MessageSquare,
  Globe,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Builder = ({ user, setUser }) => {
  // Move useNavigate hook to the top level before any conditional returns
  const navigate = useNavigate();

  // Mode State: Controlled by Mongoose `user.isSetupCompleted` flag
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic button text based on setup state
  const saveButtonText = user?.isSetupCompleted ? 'Update Agent' : 'Save Agent';

  // Form Step State (1: Identity, 2: Theme & Tone, 3: Navigation, 4: API Keys)
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Form State initialized from user context or defaults matching Mongoose Schema
  const [formData, setFormData] = useState({
    assistantName: user?.assistantName || 'Echo',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    businessDescription: user?.businessDescription || '',
    tone: user?.tone || 'friendly',
    theme: user?.theme || 'dark',
    geminiApiKey: user?.geminiApiKey || '',
    pages: user?.pages || []
  });

  // Local state for dynamic route addition
  const [newPage, setNewPage] = useState({ name: '', path: '', keywords: '' });

  // Status handler reading directly from user.geminiStatus: "active" | "quota_exceed" | "invalid"
  const apiKeyStatus = user?.geminiStatus || (user?.geminiApiKey ? 'active' : 'invalid');

  const renderApiKeyStatusUI = () => {
    switch (apiKeyStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 pt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-black text-slate-900">Active</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ml-auto flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operational
            </span>
          </div>
        );

      case 'quota_exceed':
        return (
          <div className="flex items-center gap-2 pt-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm font-black text-slate-900">Quota Exceeded</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 ml-auto flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Rate Limited
            </span>
          </div>
        );

      case 'invalid':
      default:
        return (
          <div className="flex items-center gap-2 pt-1">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-sm font-black text-slate-900">Invalid Key</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ml-auto flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600" /> Action Required
            </span>
          </div>
        );
    }
  };

  // Input Handler for top-level text fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Add Dynamic Page Route
  const handleAddPage = () => {
    if (!newPage.name || !newPage.path) return;
    
    const parsedKeywords = newPage.keywords
      ? newPage.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    setFormData((prev) => ({
      ...prev,
      pages: [...prev.pages, { name: newPage.name, path: newPage.path, keywords: parsedKeywords }]
    }));

    setNewPage({ name: '', path: '', keywords: '' });
  };

  // Execute route deletion after modal confirmation
  const confirmDeletePage = () => {
    if (deleteIndex === null) return;
    
    setFormData((prev) => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== deleteIndex)
    }));

    toast.success("Page route removed");
    setDeleteIndex(null);
  };

  // Save Assistant to Express API endpoint
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${serverURL}/api/user/save-assistant`,
        { ...formData, isSetupCompleted: true },
        { withCredentials: true }
      );

      if (!response.data.success && response.data.message) {
        toast.error(response.data.message);
        setStatusMsg({
          type: 'error',
          text: response.data.message
        });
        setLoading(false);
        return;
      }

      if (setUser && response.data?.user) {
        setUser(response.data.user);
      }

      toast.success(user?.isSetupCompleted ? "Assistant Configuration updated 👌" : "Assistant Configuration saved 👌");
      setIsEditing(false);

      setStatusMsg({ 
        type: 'success', 
        text: response.data?.message || 'Assistant configured successfully!' 
      });
    } catch (error) {
      console.error('Save Assistant Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save assistant settings. Please try again.';
      setStatusMsg({
        type: 'error',
        text: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Embed script snippet using CLIENT_URL and user._id
  const embedCode = `<script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedSnippet(true);
    toast.success("Embed snippet copied to clipboard!");
    setTimeout(() => setCopiedSnippet(false), 3000);
  };

  // Computed usage statistics matching Mongoose User Schema
  const planType = user?.plan || 'Free';
  
  // Plan-based message limits
  const isProPlan = planType.toLowerCase() === 'pro';
  const requestLimit = isProPlan ? Infinity : (user?.requestLimit && user.requestLimit > 0 ? user.requestLimit : 200);
  const totalMessages = user?.totalMessages || 0;
  
  // Messages remaining
  const messagesLeft = isProPlan ? '∞' : Math.max(0, requestLimit - totalMessages);
  
  // Usage percentage calculated correctly (0 messages used = 0%, 200 used = 100%)
  const usagePercentage = isProPlan 
    ? 0 
    : Math.min(100, Math.max(0, Math.round((totalMessages / requestLimit) * 100)));

  // Pro plan expiry (1 month from plan start)
  const planStartDate = user?.planStartDate ? new Date(user.planStartDate) : null;
  const planExpiryDate = planStartDate ? new Date(planStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const daysRemainingInPlan = planExpiryDate ? Math.ceil((planExpiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const themes = [
    { id: 'light', label: 'Light', color: 'bg-slate-100 border-slate-300 text-slate-800' },
    { id: 'dark', label: 'Dark', color: 'bg-slate-900 border-slate-700 text-white' },
    { id: 'glass', label: 'Glass', color: 'bg-white/30 backdrop-blur-md border-white/60 text-slate-900' },
    { id: 'neon', label: 'Neon', color: 'bg-slate-950 border-cyan-500 text-cyan-400' }
  ];

  const tones = [
    { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable, and engaging.' },
    { id: 'professional', label: 'Professional', desc: 'Clear, direct, and business-focused.' },
    { id: 'sales', label: 'Sales', desc: 'Persuasive, upbeat, and goal-oriented.' }
  ];

  // =========================================================================
  // CONDITION 1: DISPLAY DETAILS PAGE (IF USER IS SETUP & NOT IN EDIT MODE)
  // =========================================================================
  if (user?.isSetupCompleted && !isEditing) {
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
                    isProPlan 
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
            
            {/* Gemini API Status Card */}
            <div className="p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 flex flex-col justify-between space-y-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-black uppercase tracking-wider">Gemini API Status</span>
                  <Key className="w-4 h-4 text-indigo-600" />
                </div>
                
                {renderApiKeyStatusUI()}
              </div>
              
              <p className="text-[11px] font-medium text-slate-500 pt-2">
                {apiKeyStatus === 'active' && 'Gemini API key is configured and active.'}
                {apiKeyStatus === 'quota_exceed' && 'API quota reached. Update key or upgrade tier.'}
                {apiKeyStatus === 'invalid' && 'API key is missing or unauthorized.'}
              </p>
            </div>

            {/* Messages Usage Metric */}
            <div className={`p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 flex flex-col justify-between space-y-3 ${isProPlan ? 'ring-2 ring-emerald-300' : ''}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-black uppercase tracking-wider">Usage Limit</span>
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  {isProPlan ? (
                    <>
                      <span className="text-2xl font-black text-emerald-600">Unlimited</span>
                      <span className="text-xs font-bold text-slate-400">Pro Plan</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-900">
                        {totalMessages} <span className="text-sm font-bold text-slate-400">/ {requestLimit}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {messagesLeft} left
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar & Status Text */}
              {isProPlan ? (
                <div className="text-[10px] font-bold text-emerald-600 pt-2 flex items-center justify-between">
                  <span>✓ Unlimited usage active</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        usagePercentage >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`} 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-0.5">
                    <span>{usagePercentage}% used</span>
                    <span>{messagesLeft} left</span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Tier Callout */}
            <div className={`p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60 flex flex-col justify-between space-y-2 ${isProPlan ? 'ring-2 ring-emerald-300' : ''}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-black uppercase tracking-wider">Current Tier</span>
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-black text-slate-900 pt-1">
                  {planType} Plan
                </div>
              </div>
              {isProPlan ? (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-emerald-600 pt-2">
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
                <p onClick={() => navigate("/billing")} className="text-[11px] font-bold text-indigo-600 cursor-pointer hover:underline pt-2">
                  Upgrade to Pro for unlimited usage & custom domain branding →
                </p>
              )}
            </div>

          </div>

          {/* Details & Embed Script Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Box: Active Agent Configuration */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 flex flex-col justify-between space-y-5">
              <div className="space-y-5">
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
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Where to paste this script?</h3>
                  <p className="text-xs font-medium text-slate-500">
                    Paste this script before the closing <code className="text-indigo-600 font-mono">&lt;/body&gt;</code> tag of your website HTML file.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-600">Example:</span>
                  <pre className="bg-[#0b1020] text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto shadow-inner leading-relaxed">
{`<body>
  Your Website Content
  <script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>
</body>`}
                  </pre>
                </div>
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
  }

  // =========================================================================
  // CONDITION 2: DISPLAY MULTI-STEP BUILDER (FIRST TIME OR EDITING)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f0f3f9] text-slate-800 p-4 sm:p-8 font-sans flex items-center justify-center">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Lottie Animation Showcase & Overview */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 flex flex-col justify-between items-center text-center space-y-4 h-full">
            
            <div className="flex flex-col items-center space-y-4 w-full">
              {/* Lottie Container */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-[#f0f3f9] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center overflow-hidden p-2">
                <DotLottieReact
                  src="https://lottie.host/6e628675-de86-4e96-bab5-cae7c9396dd3/hbpdXkgrtz.lottie"
                  loop
                  autoplay
                  className="w-full h-full pointer-events-none"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-900">Hi there! I'm {formData.assistantName || 'Echo'}</h2>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Configure my persona, website behavior, theme aesthetics, and domain routing to match your brand seamlessly.
                </p>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-200/60 flex flex-col gap-2 text-left">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Active Theme:</span>
                <span className="capitalize text-indigo-600">{formData.theme}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Tone Style:</span>
                <span className="capitalize text-indigo-600">{formData.tone}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Mapped Pages:</span>
                <span className="text-indigo-600">{formData.pages.length} Routes</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Builder Form Content */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Header Title Banner */}
          <div className="flex items-center justify-between p-6 rounded-3xl bg-[#f0f3f9] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">AI Assistant Configurator</h1>
                <p className="text-xs font-semibold text-slate-500">
                  Setup your custom WebMate agent details and domain page routes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.isSetupCompleted && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 rounded-2xl bg-[#f0f3f9] text-slate-600 text-xs font-extrabold shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:text-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:bg-indigo-700 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : saveButtonText}</span>
              </button>
            </div>
          </div>

          {/* Status Alert Toast */}
          {statusMsg.text && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 1, label: 'Identity', icon: Building2 },
              { id: 2, label: 'Theme & Tone', icon: Palette },
              { id: 3, label: 'Site Navigation', icon: Compass },
              { id: 4, label: 'API Keys', icon: Key }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeStep === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStep(tab.id)}
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]'
                      : 'bg-[#f0f3f9] text-slate-600 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Config Form Body */}
          <div className="flex-1 p-6 sm:p-8 rounded-3xl bg-[#f0f3f9] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] border border-white/60 space-y-6">
            
            {/* STEP 1: IDENTITY */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Business & Agent Identity
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600">Assistant Name</label>
                    <input
                      type="text"
                      name="assistantName"
                      value={formData.assistantName}
                      onChange={handleChange}
                      placeholder="e.g. Echo"
                      className="w-full bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600">Business Type / Niche</label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    placeholder="e.g. E-Commerce, SaaS, Digital Agency"
                    className="w-full bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600">Business Description</label>
                  <textarea
                    name="businessDescription"
                    rows={4}
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe your company services, products, or core value props..."
                    className="w-full bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] px-4 py-3 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: THEME & TONE */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-600" /> Widget Design Theme
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, theme: t.id }))}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${t.color} ${
                          formData.theme === t.id
                            ? 'ring-4 ring-indigo-500/30 scale-105 shadow-lg'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span className="text-xs font-black capitalize">{t.label}</span>
                        {formData.theme === t.id && <Check className="w-4 h-4 text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Conversational Tone
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tones.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, tone: t.id }))}
                        className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                          formData.tone === t.id
                            ? 'bg-indigo-600 text-white shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]'
                            : 'bg-[#f0f3f9] text-slate-700 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff]'
                        }`}
                      >
                        <h4 className="text-xs font-black capitalize">{t.label}</h4>
                        <p className={`text-[10px] mt-1 ${formData.tone === t.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {t.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: NAVIGATION PAGES */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" /> Website Navigation Mapping
                </h2>

                <div className="p-4 rounded-2xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-700">Add Page Route</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Page Name (e.g. Pricing)"
                      value={newPage.name}
                      onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                      className="bg-white px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="Path (e.g. /pricing)"
                      value={newPage.path}
                      onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                      className="bg-white px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="Keywords (comma separated)"
                      value={newPage.keywords}
                      onChange={(e) => setNewPage({ ...newPage, keywords: e.target.value })}
                      className="bg-white px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPage}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Page
                  </button>
                </div>

                {/* Dynamic Pages List */}
                <div className="space-y-2 pt-2">
                  {formData.pages.length === 0 ? (
                    <p className="text-xs font-medium text-slate-400 italic text-center py-4">
                      No navigation routes added yet.
                    </p>
                  ) : (
                    formData.pages.map((p, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#f0f3f9] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{p.name}</span>
                            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              {p.path}
                            </span>
                          </div>
                          {p.keywords && p.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.keywords.map((kw, idx) => (
                                <span key={idx} className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-md">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteIndex(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: GEMINI API KEYS */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-600" /> Custom Gemini API Credentials
                  </h2>
                  
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-sm hover:shadow"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600">Google Gemini API Key</label>
                  <input
                    type="password"
                    name="geminiApiKey"
                    value={formData.geminiApiKey}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] px-4 py-3 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none"
                  />
                  <p className="text-[10px] font-medium text-slate-500">
                    Optional. Don't have a key? Click <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">here</a> to generate one from Google AI Studio.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Route Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f0f3f9] border border-white/60 p-6 rounded-3xl max-w-sm w-full shadow-[12px_12px_24px_#b8c2d1,-12px_-12px_24px_#ffffff] space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setDeleteIndex(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-100 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Confirm Deletion</h3>
            </div>

            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              Are you sure you want to remove the route{" "}
              <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                {formData.pages[deleteIndex]?.path}
              </span>
              ?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteIndex(null)}
                className="flex-1 py-2.5 rounded-2xl bg-[#f0f3f9] text-slate-700 text-xs font-bold shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:text-slate-900 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePage}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-extrabold shadow-md hover:bg-rose-700 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;