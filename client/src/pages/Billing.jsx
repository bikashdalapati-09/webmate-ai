import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Check, 
  X,
  Zap, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  MessageSquareText,
  Infinity as InfinityIcon,
  Cpu,
  Bot,
  Globe2,
  Lock,
  Headphones,
  FileText,
  Database,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { serverURL } from '../App';

const Billing = ({ user, setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isSetupCompleted) {
      toast.error("Set Your assistant first 😊");
      navigate("/builder");
    }
  }, [user, navigate]);

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  
  // Track active visual selection (Default: Free)
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'Free'); 
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Active status directly derived from current user state
  const currentPlan = user?.plan || 'Free';
  const isProPlan = currentPlan.toLowerCase() === 'pro';
  
  // Message usage tracking
  const totalMessages = user?.totalMessages || 0;
  const requestLimit = isProPlan ? Infinity : (user?.requestLimit && user.requestLimit > 0 ? user.requestLimit : 200);
  const messagesLeft = isProPlan ? '∞' : Math.max(0, requestLimit - totalMessages);
  const usagePercentage = isProPlan ? 0 : Math.min(100, Math.round((totalMessages / requestLimit) * 100));
  
  // Pro plan expiry (1 month from plan start)
  const planStartDate = user?.planStartDate ? new Date(user.planStartDate) : null;
  const planExpiryDate = planStartDate ? new Date(planStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const daysRemainingInPlan = planExpiryDate ? Math.ceil((planExpiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
  
  const renewDate = planExpiryDate ? planExpiryDate.toLocaleDateString() : 'N/A';

  const handleUpgradePro = async (e) => {
    if (e) e.stopPropagation();
    setSelectedPlan('Pro');
    setLoadingPlan('Pro');

    try {
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        toast.error("Razorpay configuration error. Please contact support.");
        setLoadingPlan(null);
        return;
      }

      const res = await axios.post(
        `${serverURL}/api/billing/order`, 
        { plan: "pro", duration: billingCycle }, 
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to create payment order");
        setLoadingPlan(null);
        return;
      }

      const order = res.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Webmate-ai",
        description: "Pro Plan Subscription",
        order_id: order.id,

        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${serverURL}/api/billing/verify`, 
              response, 
              { withCredentials: true }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment Successful 🎉");
              setUser(verifyResponse.data.user);
            } else {
              toast.error(verifyResponse.data.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null)
        },
        theme: { color: "#4f46e5" },
        prefill: {
          email: user?.email || ""
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment. Please try again.");
      setLoadingPlan(null);
    }
  };

  // Feature Breakdown
  const featuresMatrix = [
    // --- Core AI & Knowledge Base (Highlighted RAG Features) ---
    { name: 'Custom Bot Training / RAG', free: false, pro: 'Full Support (PDF, Docs, URLs)', icon: Bot, highlight: true },
    { name: 'Knowledge Base Documents', free: '1 File (Max 2MB)', pro: 'Unlimited Uploads (Max 50MB/file)', icon: FileText, highlight: true },
    { name: 'Vector Storage & Indexing', free: '50 Chunks', pro: 'Unlimited Vector Chunks', icon: Database, highlight: true },

    // --- Message & Engine Performance ---
    { name: 'Monthly Message Allowance', free: '200 Messages', pro: 'Unlimited', icon: MessageSquareText },
    { name: 'AI Model Engine', free: 'Standard (Gemini Flash)', pro: 'High-Reasoning (Gemini Pro)', icon: Cpu },
    { name: 'Response Latency', free: 'Standard Queue', pro: 'Ultra-Fast Priority', icon: Zap },

    // --- Deployment & Integration ---
    { name: 'Domain Embedding & Widgets', free: '1 Website', pro: 'Unlimited Websites', icon: Globe2 },
    { name: 'Custom Widget Branding', free: 'Powered by WebMate', pro: 'Remove Branding & Custom Themes', icon: Sparkles },

    // --- Lead Gen & Analytics ---
    { name: 'Lead Collection & Forms', free: 'Basic (Email Only)', pro: 'Custom Form Fields & CRM Sync', icon: Users },
    { name: 'Support SLA', free: 'Community Forum', pro: '24/7 Priority Support', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#e8ecf4] py-10 px-4 sm:px-6 font-sans antialiased text-slate-700 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 max-w-xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-indigo-600 text-xs font-semibold shadow-[3px_3px_6px_#c5c9d1,-3px_-3px_6px_#ffffff]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> 
            <span>Billing & Workspace Tier</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Plans built for growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Upgrade your AI agents with zero rate limits, high-reasoning compute, and dynamic domain deployment.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-slate-800' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full p-1 shadow-[inset_2px_2px_4px_#c5c9d1,inset_-2px_-2px_4px_#ffffff] bg-[#e8ecf4] flex items-center transition-all cursor-pointer"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-4 h-4 rounded-full bg-indigo-600 shadow-md ${billingCycle === 'yearly' ? 'ml-auto' : ''}`}
              />
            </button>
            <span className={`text-xs font-semibold transition-colors flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-slate-800' : 'text-slate-400'}`}>
              Yearly
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Current Workspace Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6 bg-[#e8ecf4] shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Status</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-[inset_1px_1px_2px_#c5c9d1,inset_-1px_-1px_2px_#ffffff] ${
                  isProPlan ? 'text-indigo-600' : 'text-emerald-600'
                }`}>
                  <CheckCircle2 className="w-3 h-3" /> {currentPlan} Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {isProPlan ? 'Pro Unlimited Access' : 'Starter Free Tier'}
              </h2>
              <p className="text-xs text-slate-500">
                {isProPlan 
                  ? `Renewal scheduled for ${renewDate}`
                  : 'Upgrade to remove monthly message limits and unlock custom bot embeddings.'}
              </p>
            </div>

            {/* Status Widget Logic */}
            {isProPlan ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#e8ecf4] shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <InfinityIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Unlimited Messages</p>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    {daysRemainingInPlan && daysRemainingInPlan > 0 
                      ? `${daysRemainingInPlan} days remaining` 
                      : 'Plan expires soon'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-64 p-3.5 rounded-xl bg-[#e8ecf4] shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff] space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <MessageSquareText className="w-3.5 h-3.5 text-indigo-600" /> Usage Limit
                  </span>
                  <span className="text-slate-800 font-bold">
                    {totalMessages} / {requestLimit}
                  </span>
                </div>
                
                <div className="w-full bg-[#dbe0ea] rounded-full h-2.5 p-0.5 shadow-[inset_1px_1px_2px_#b8bdc7]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-1.5 rounded-full ${
                      usagePercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{usagePercentage}% used</span>
                  <span>{messagesLeft} left</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Free Tier Card */}
          <motion.div 
            onClick={() => setSelectedPlan('Free')}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl bg-[#e8ecf4] p-6 flex flex-col justify-between cursor-pointer transition-all ${
              selectedPlan === 'Free' 
                ? 'shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff] border-2 border-indigo-500/80 ring-2 ring-indigo-500/20' 
                : 'shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff] border border-white/40 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Free Tier</h3>
                  <p className="text-xs text-slate-500">Perfect for testing & sandbox.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#e8ecf4] shadow-[3px_3px_6px_#c5c9d1,-3px_-3px_6px_#ffffff] text-slate-600">
                  <MessageSquareText className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800">₹0</span>
                <span className="text-xs font-medium text-slate-400">/ lifetime</span>
              </div>

              <div className="h-px bg-slate-300/50 shadow-[0_1px_0_rgba(255,255,255,0.8)]" />

              <ul className="space-y-3 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>200 Messages</strong> total allowance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Standard Execution Speed</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400">
                  <div className="p-0.5 rounded-full bg-slate-300/40 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-through">Custom RAG Knowledge base</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400">
                  <div className="p-0.5 rounded-full bg-slate-300/40 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-through">Webmate API Keys</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-[#e8ecf4] shadow-[inset_2px_2px_4px_#c5c9d1,inset_-2px_-2px_4px_#ffffff] text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Default Active Plan
              </div>
            </div>
          </motion.div>

          {/* Pro Tier Card */}
          <motion.div 
            onClick={() => setSelectedPlan('Pro')}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl bg-[#e8ecf4] p-6 flex flex-col justify-between relative cursor-pointer transition-all ${
              selectedPlan === 'Pro' 
                ? 'shadow-[0_0_20px_rgba(79,70,229,0.25)] border-2 border-indigo-600 ring-2 ring-indigo-500/30' 
                : 'shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff] border border-white/40 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Recommended
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Pro Plan</h3>
                  <p className="text-xs text-slate-500">Unrestricted agent capabilities.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#e8ecf4] shadow-[3px_3px_6px_#c5c9d1,-3px_-3px_6px_#ffffff] text-indigo-600">
                  <Zap className="w-5 h-5 fill-indigo-500/20" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={billingCycle}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-4xl font-extrabold text-slate-800"
                  >
                    {billingCycle === 'monthly' ? '₹19' : '₹180'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs font-semibold text-slate-500">
                  / {billingCycle === 'monthly' ? '30 Days' : 'Year'}
                </span>
              </div>

              <div className="h-px bg-slate-300/50 shadow-[0_1px_0_rgba(255,255,255,0.8)]" />

              <ul className="space-y-3 text-xs font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-slate-900">Unlimited Messages</strong> (No Limits)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>High-Reasoning Gemini Engine</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Custom Document & PDF Embeddings</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Unlimited Website Widget Embeds</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleUpgradePro}
                disabled={isProPlan || loadingPlan === 'Pro'}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 shadow-[4px_4px_10px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProPlan ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Member Active
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> 
                    {loadingPlan === 'Pro' ? 'Processing...' : `Upgrade to Pro (${billingCycle === 'monthly' ? '₹19' : '₹180'})`}
                  </>
                )}
              </button>
            </div>
          </motion.div>

        </div>

        {/* Enhanced Full Feature Matrix Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-5 sm:p-7 bg-[#e8ecf4] shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff] space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300/50 pb-4 gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-500/20" /> Full Feature Comparison
              </h3>
              <p className="text-xs text-slate-500 font-medium">Explore standard vs pro AI workspace limits</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-600 bg-[#e8ecf4] shadow-[inset_2px_2px_4px_#c5c9d1,inset_-2px_-2px_4px_#ffffff]">
              <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" /> Advanced RAG Enabled
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-300/60">
                  <th className="py-3.5 px-4 w-1/2">Capabilities & Limits</th>
                  <th className="py-3.5 px-4 w-1/4 text-center">Free Starter</th>
                  <th className="py-3.5 px-4 w-1/4 text-center text-indigo-600">Pro Tier (₹19)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300/40 font-medium text-slate-600">
                {featuresMatrix.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <tr 
                      key={idx} 
                      className={`transition-all ${
                        item.highlight 
                          ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent hover:from-indigo-500/15' 
                          : 'hover:bg-slate-200/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shadow-[2px_2px_4px_#c5c9d1,-2px_-2px_4px_#ffffff] bg-[#e8ecf4] ${
                            item.highlight ? 'text-indigo-600' : 'text-slate-500'
                          }`}>
                            <Icon className="w-4 h-4 shrink-0" />
                          </div>
                          <span className="flex items-center gap-2">
                            {item.name}
                            {item.highlight && (
                              <span className="text-[9px] bg-indigo-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                                RAG
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof item.free === 'boolean' ? (
                          item.free ? (
                            <div className="inline-flex p-1 rounded-full bg-emerald-500/10 text-emerald-600">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex p-1 rounded-full bg-slate-300/30 text-slate-400">
                              <X className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <span className="text-slate-500 font-semibold">{item.free}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <div className="inline-flex p-1 rounded-full bg-indigo-600 text-white shadow-xs">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex p-1 rounded-full bg-slate-300/30 text-slate-400">
                              <X className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <span className={item.highlight ? 'text-indigo-600 font-extrabold' : 'text-slate-800'}>
                            {item.pro}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Transaction History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl p-5 sm:p-6 bg-[#e8ecf4] shadow-[8px_8px_16px_#c5c9d1,-8px_-8px_16px_#ffffff] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Payment Receipts
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Secured by Razorpay</span>
          </div>

          <div className="p-3 rounded-xl bg-[#e8ecf4] shadow-[inset_2px_2px_4px_#c5c9d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-slate-800">Free Tier Account Creation</p>
                <p className="text-[10px] text-slate-400">Initial Registration</p>
              </div>
            </div>
            <p className="font-extrabold text-slate-800">₹0.00</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Billing;