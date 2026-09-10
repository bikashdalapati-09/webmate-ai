import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Database, 
  Zap, 
  Mic, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Sparkle,
  KeyRound,
  FileText,
  MessageSquare,
  Sliders,
  Check
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase.js';
import axios from "axios"
import {serverURL} from "../App.jsx"
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = ({setUser}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);

  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setIsAuthSuccess(false);

    try {
      const result = await signInWithPopup(auth, provider);
      const {displayName, email} = result.user

      const res = await axios.post(serverURL + "/api/auth/signin", {
        name: displayName,
        email: email
      }, {withCredentials: true})

      setUser(res.data)
      toast.success("Login Successfully 🎉")

      // Trigger success state and animation
      setIsAuthLoading(false);
      setIsAuthSuccess(true);

      // Hold success state for 1.5 seconds before navigating/resetting
      setTimeout(() => {
        setIsAuthSuccess(false);
        navigate("/")
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 z-0 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/40 via-violet-200/30 to-blue-300/40 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tr from-blue-300/40 via-indigo-200/30 to-violet-300/40 rounded-full blur-[120px] z-0 pointer-events-none" />

      {/* Main Layout Grid */}
      <div className="w-full max-w-7xl mx-auto flex min-h-screen p-4 sm:p-6 lg:p-8 z-10 relative">
        
        {/* Left Side: Product Showcase & Feature Matrix */}
        <div className="hidden lg:flex lg:w-7/12 p-10 flex-col justify-between rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-indigo-950/5 relative overflow-hidden mr-6">
          
          {/* Top Header Logo */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  WebMate<span className="text-indigo-600">.ai</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Agentic Engine
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>v2.5 Multimodal Agents</span>
            </div>
          </div>

          {/* Core Value Proposition */}
          <div className="my-auto py-4 z-10 space-y-6 max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Deploy autonomous <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
                AI agents on your site.
              </span>
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              Ingest website docs, PDFs, and FAQs into a vector knowledge base. Let your live widget speak naturally, navigate pages hands-free, and trigger external API tools.
            </p>

            {/* Feature Cards Matrix */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">RAG Knowledge Base</p>
                  <p className="text-[11px] text-slate-500">Vector Search Embeddings</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Tool Calling API</p>
                  <p className="text-[11px] text-slate-500">Live External Actions</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                  <Mic className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Real-time Voice</p>
                  <p className="text-[11px] text-slate-500">Natural Speech AI</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Smart Voice Nav</p>
                  <p className="text-[11px] text-slate-500">Hands-free Page Routing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Footer */}
          <div className="z-10 p-4 rounded-2xl bg-white/90 border border-slate-200/70 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-xs text-white font-bold">WM</div>
                <div className="w-8 h-8 rounded-full bg-violet-600 border-2 border-white flex items-center justify-center text-xs text-white font-bold">AI</div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs text-white font-bold">RG</div>
              </div>
              <p className="text-xs font-medium text-slate-600">
                Powering voice and RAG support widgets globally
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.9% Context Accuracy
            </div>
          </div>
        </div>

        {/* Right Side: Auth Container */}
        <div className="w-full lg:w-5/12 flex items-center justify-center p-2 sm:p-6 relative">
          
          <div className="w-full max-w-md space-y-6 relative">
            
            {/* Mobile Branding Header */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                WebMate<span className="text-indigo-600">.ai</span>
              </span>
            </div>

            {/* Title Header */}
            <div className="text-center lg:text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-1">
                <Sparkle className="w-3.5 h-3.5 text-indigo-600" /> Single Sign-On Access
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500">
                Access your agent workflows, custom knowledge base, and live controls
              </p>
            </div>

            {/* Auth Card Outer Wrapper */}
            <div className="relative group">
              
              {/* Backlighting Aura Effect */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/35 via-violet-500/40 to-blue-500/30 rounded-[40px] blur-2xl opacity-90 transition-all duration-500 group-hover:opacity-100 pointer-events-none -z-10" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-600/35 rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Main Auth Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-indigo-950/10 relative z-10">
                
                {/* Google Auth Container */}
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      Fast Authentication
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" /> OAuth 2.0
                    </span>
                  </div>

                  {/* Animated Google Auth Button */}
                  <button
                    onClick={handleGoogleLogin}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isAuthLoading || isAuthSuccess}
                    className={`w-full relative overflow-hidden group/btn flex items-center justify-between text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all duration-300 cursor-pointer disabled:opacity-90 ${
                      isAuthSuccess 
                        ? 'bg-emerald-600 shadow-emerald-500/30' 
                        : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]'
                    }`}
                  >
                    {/* Left-to-Right Shimmer Beam */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none ${
                        isHovered && !isAuthLoading && !isAuthSuccess ? 'translate-x-full' : ''
                      }`}
                    />

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-2 rounded-lg bg-white shadow-xs flex-shrink-0 group-hover/btn:scale-110 transition-transform duration-300">
                        <FcGoogle className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-white transition-all duration-300">
                          {isAuthLoading 
                            ? 'Connecting...' 
                            : isAuthSuccess 
                              ? 'Authenticated!' 
                              : 'Sign in with Google'}
                        </span>
                        <span className="block text-[11px] text-indigo-100 font-normal">
                          {isAuthSuccess ? 'Redirecting to workspace...' : 'Instant single sign-on'}
                        </span>
                      </div>
                    </div>

                    {/* Animated Icon States */}
                    {isAuthLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                    ) : isAuthSuccess ? (
                      <div className="p-1.5 rounded-lg bg-white text-emerald-600 shadow-md scale-110 animate-bounce relative z-10 flex-shrink-0 transition-all duration-300">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-white/20 text-white relative z-10 group-hover/btn:bg-white group-hover/btn:text-indigo-600 group-hover/btn:shadow-md group-hover/btn:ring-2 group-hover/btn:ring-white/40 transition-all duration-300 flex-shrink-0">
                        <ArrowRight 
                          className="w-4 h-4 transform transition-all duration-300 ease-out group-hover/btn:translate-x-1 group-hover/btn:scale-110" 
                        />
                      </div>
                    )}
                  </button>
                </div>

                {/* Updated Platform Features (2x2 Grid) */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center lg:text-left">
                    Platform Capabilities
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Gemini API Integration */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">Gemini Key</p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Custom API key setup</p>
                      </div>
                    </div>

                    {/* PDF Knowledge Base */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-violet-50 text-violet-600 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">PDF Vectoring</p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Doc RAG embeddings</p>
                      </div>
                    </div>

                    {/* 200 Free Messages */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">200 Free Msgs</p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Starter credit tier</p>
                      </div>
                    </div>

                    {/* Agent Persona Tone */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">Agent Tones</p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Friendly / Sales / Formal</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Footer */}
                <p className="text-[11px] text-center text-slate-400 leading-relaxed pt-3 border-t border-slate-100">
                  By logging in, you agree to WebMate AI's{' '}
                  <a href="#terms" className="text-slate-600 hover:text-indigo-600 font-medium underline underline-offset-2">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" className="text-slate-600 hover:text-indigo-600 font-medium underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Footer Support Link */}
            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 pt-1">
              <span>Need assistance logging in?</span>
              <a href="#support" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5">
                Contact WebMate Support <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;