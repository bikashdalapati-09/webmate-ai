import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Bot, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  UserPlus, 
  Globe2, 
  Copy, 
  Check, 
  ChevronRight,
  UserCheck,
  SlidersHorizontal,
  UploadCloud,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  Send,
  Radio,
  Edit3,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serverURL } from '../App';

const Home = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // --- Ref for Auto-Scrolling ---
  const chatContainerRef = useRef(null);

  // --- Dynamic Assistant Name (Default: "Echo") ---
  const [assistantName, setAssistantName] = useState('Echo');
  const [isEditingName, setIsEditingName] = useState(false);

  // --- Project Guide Bot UI & API State ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your WebMate AI Guide. Ask me anything about embedding AI agents or custom tool calling!"
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom whenever messages update or loading state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // --- Voice Assistant State & Themes ---
  const [isListening, setIsListening] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('Listening...');
  const [activeVoiceTheme, setActiveVoiceTheme] = useState('glass');

  const voiceThemes = [
    {
      id: 'light',
      name: 'Light',
      cardBg: 'bg-[#F2F4F8] text-slate-800 shadow-[10px_10px_20px_#dcdfe6,-10px_-10px_20px_#ffffff] border border-white/80',
      headerBg: 'bg-[#F2F4F8] shadow-[inset_2px_2px_5px_#dcdfe6,inset_-2px_-2px_5px_#ffffff]',
      orbBg: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(99,102,241,0.25)]',
      micActive: 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] ring-4 ring-indigo-500/20',
      micInactive: 'bg-[#F2F4F8] text-indigo-600 shadow-[6px_6px_12px_#dcdfe6,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_6px_#dcdfe6,-2px_-2px_6px_#ffffff]',
      statusBg: 'bg-[#F2F4F8] shadow-[inset_2px_2px_4px_#dcdfe6,inset_-2px_-2px_4px_#ffffff] text-slate-600',
      accentText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      barColor: 'bg-indigo-600'
    },
    {
      id: 'dark',
      name: 'Dark',
      cardBg: 'bg-slate-900 text-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-slate-800/80',
      headerBg: 'bg-slate-800/60 text-slate-100 border border-slate-700/50',
      orbBg: 'bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_40px_rgba(168,85,247,0.4)]',
      micActive: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.6)] ring-4 ring-emerald-500/20',
      micInactive: 'bg-slate-800/90 text-emerald-400 border border-slate-700 shadow-md hover:bg-slate-800',
      statusBg: 'bg-slate-800/40 border border-slate-700/50 text-slate-300',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
      barColor: 'bg-emerald-400'
    },
    {
      id: 'glass',
      name: 'Glass',
      cardBg: 'bg-white/10 backdrop-blur-2xl border border-white/70 shadow-[0_16px_40px_0_rgba(31,38,135,0.08)] text-slate-900 relative overflow-hidden',
      headerBg: 'bg-white/20 backdrop-blur-md border border-white/60 shadow-inner',
      orbBg: 'bg-gradient-to-tr from-sky-400/80 via-cyan-300/70 to-indigo-400/80 shadow-[0_0_40px_rgba(56,189,248,0.4)]',
      micActive: 'bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-[0_0_25px_rgba(14,165,233,0.6)] ring-4 ring-sky-300/40',
      micInactive: 'bg-white/30 backdrop-blur-md text-sky-700 border border-white/80 shadow-sm hover:bg-white/50',
      statusBg: 'bg-white/25 backdrop-blur-md border border-white/60 text-slate-800',
      accentText: 'text-sky-600',
      badgeBg: 'bg-white/40 text-sky-800 border-white/80',
      barColor: 'bg-sky-500'
    },
    {
      id: 'neon',
      name: 'Neon',
      cardBg: 'bg-slate-950 text-cyan-400 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      headerBg: 'bg-slate-900/90 border border-cyan-500/30 text-cyan-300',
      orbBg: 'bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 shadow-[0_0_40px_rgba(6,182,212,0.5)]',
      micActive: 'bg-cyan-400 text-black shadow-[0_0_30px_rgba(6,182,212,0.9)] ring-4 ring-cyan-400/30',
      micInactive: 'bg-slate-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:border-cyan-400',
      statusBg: 'bg-slate-900/60 border border-cyan-500/30 text-cyan-300',
      accentText: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
      barColor: 'bg-cyan-400'
    }
  ];

  const currentTheme = voiceThemes.find(t => t.id === activeVoiceTheme) || voiceThemes[0];

  const sampleEmbedCode = `  <body>
  <script 
  src="http://your-site/assistant.js" 
  data-user-id="*****************">
  </script>
  </body>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleEmbedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userMessageText = inputQuery;
    const userMsg = { id: Date.now(), sender: 'user', text: userMessageText };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${serverURL}/api/user/project-ai-response`, {
        query: userMessageText,
      },{withCredentials: true});

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.result
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I ran into an error connecting to the backend. Please try again.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceAssistant = () => {
    if (!isListening) {
      setIsListening(true);
      setVoiceStatus('Listening...');
    } else {
      setIsListening(false);
      setVoiceStatus('Tap mic to start');
    }
  };

  const stepsList = [
    {
      step: '01',
      icon: UserCheck,
      title: 'Sign Up Free',
      description: 'Continue with Google and create your AI assistant instantly with zero setup hassle.',
      badgeColor: 'text-[#5B4EFF]'
    },
    {
      step: '02',
      icon: SlidersHorizontal,
      title: 'Customize Assistant',
      description: 'Define your business identity, select tone and voice guidelines, and apply your custom brand theme.',
      badgeColor: 'text-purple-600'
    },
    {
      step: '03',
      icon: UploadCloud,
      title: 'Upload Knowledge Base',
      description: 'Add your PDFs, documentation, and business details so your agent learns your exact domain context.',
      badgeColor: 'text-violet-600'
    },
    {
      step: '04',
      icon: Cpu,
      title: 'Train Your Assistant',
      description: 'Our RAG engine processes your knowledge base to deliver accurate, tailored responses.',
      badgeColor: 'text-blue-600'
    },
    {
      step: '05',
      icon: Code2,
      title: 'Embed Anywhere',
      description: 'Copy a lightweight script tag and deploy your live AI agent to any website seamlessly.',
      badgeColor: 'text-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F172A] font-sans antialiased selection:bg-[#5B4EFF] selection:text-white">
      
      {/* Embedded CSS Animations & Scrollbar Hiding Utility */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes orbGlow {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .animate-float {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .animate-orb {
          animation: orbGlow 3s ease-in-out infinite;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 shadow-sm border border-white/90 text-xs font-semibold text-[#5B4EFF]">
              <Sparkles className="w-3.5 h-3.5 text-[#5B4EFF] animate-spin" style={{ animationDuration: '5s' }} />
              <span>Next-Gen Voice & Agentic RAG Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-[#0F172A] leading-[1.12]">
              Deploy Intelligent <br />
              <span className="text-[#5B4EFF]">Voice & Text AI <br />Agents</span> to Any <br />Website.
            </h1>

            <p className="text-base sm:text-lg font-medium text-slate-500 max-w-xl leading-relaxed">
              Build autonomous AI assistants for your website. Empower visitors with interactive chat support, real-time voice audio, context-aware RAG search, and custom API actions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/builder')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#5B4EFF] to-[#6355FF] shadow-[0_10px_25px_rgba(91,78,255,0.3)] hover:shadow-[0_14px_30px_rgba(91,78,255,0.4)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-white" />
                <span>Build Your AI Agent Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => navigate('/billing')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-700 bg-white/80 border border-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>View Pricing</span>
              </button>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2 p-2.5 rounded-full bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero-Code Embed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-full bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#5B4EFF]" />
                <span>Custom Tool Calling</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-full bg-white/60 border border-white/80 shadow-sm col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                <span>Real-Time Voice & Chat</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 w-full flex justify-center">
            <div className="w-full max-w-md rounded-[32px] bg-white/60 border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between h-[420px] backdrop-blur-sm">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/50 border border-slate-200/40 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#5B4EFF] flex items-center justify-center text-white shadow-md">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#0F172A]">WebMate Co-Pilot</h3>
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Assistant
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#5B4EFF] bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  Interactive
                </span>
              </div>

              {/* Chat Message Window (Hidden Scrollbar + Auto Scroll Ref) */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-3 px-1 py-2 my-1 no-scrollbar"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                        msg.sender === 'user'
                          ? 'bg-[#5B4EFF] text-white rounded-br-none shadow-md'
                          : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
                      }`}
                    >
                      <ReactMarkdown 
                        components={{
                          p: ({ node, ...props }) => <p className="m-0 inline" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-extrabold text-[#5B4EFF]" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                
                {/* Loading State Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl text-xs bg-white text-slate-500 border border-slate-100 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5B4EFF]" />
                      <span>Bot is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask project guide..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-100/70 border border-slate-200/50 text-xs font-medium text-slate-800 placeholder-slate-400 px-4 py-3 rounded-full focus:outline-none focus:bg-white transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-3 rounded-full bg-[#5B4EFF] text-white shadow-[0_4px_12px_rgba(91,78,255,0.3)] hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

        </div>
      </section>

      {/* STEPS SECTION */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white/90 text-[11px] font-bold text-[#5B4EFF] mb-3 shadow-sm">
            <Zap className="w-3.5 h-3.5" /> Rapid Deployment
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Get Started in Minutes
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500">
            Simple setup. No complicated integration required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {stepsList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={index} 
                className="p-5 rounded-3xl bg-white/60 border border-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50/70 border border-indigo-100/50 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${item.badgeColor}`} />
                    </div>
                    <span className="text-[11px] font-black text-slate-400 bg-slate-100/70 px-2.5 py-1 rounded-xl">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#0F172A] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-[#5B4EFF]">
                  <span>Seamless Setup</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* VOICE ASSISTANT DEMO */}
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-6">
          
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/60 text-[11px] font-bold text-[#5B4EFF] shadow-sm">
              <Volume2 className="w-3.5 h-3.5" /> Interactive Widget Preview
            </div>
            <h2 className="text-2xl font-black text-[#0F172A]">
              Voice Assistant Demo
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Customize assistant name & test all 4 themes with live audio animations.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto p-2 rounded-2xl bg-slate-100/70 border border-slate-200/40">
            <span className="text-xs font-extrabold text-slate-500 ml-2">Name:</span>
            {isEditingName ? (
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="bg-white px-2 py-1 rounded-lg text-xs font-extrabold text-[#5B4EFF] focus:outline-none shadow-inner w-32"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 text-xs font-black text-[#5B4EFF] hover:text-indigo-700 cursor-pointer"
              >
                <span>{assistantName || 'Echo'} AI</span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
            {voiceThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveVoiceTheme(theme.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer capitalize flex items-center gap-1.5 ${
                  activeVoiceTheme === theme.id
                    ? 'bg-[#5B4EFF] text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200/60 hover:text-[#5B4EFF]'
                }`}
              >
                <Radio className={`w-3 h-3 ${activeVoiceTheme === theme.id ? 'text-indigo-200' : 'text-slate-400'}`} />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center w-full">
            <div className={`w-[320px] h-[460px] rounded-[38px] p-6 flex flex-col justify-between items-center text-center transition-all duration-300 relative ${currentTheme.cardBg}`}>
              
              {activeVoiceTheme === 'glass' && (
                <>
                  <div className="absolute -top-16 -left-16 w-40 h-40 bg-sky-200/50 rounded-full blur-2xl pointer-events-none animate-pulse" />
                  <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-200/50 rounded-full blur-2xl pointer-events-none animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/10 pointer-events-none" />
                </>
              )}

              <div className={`flex items-center justify-between w-full p-2.5 rounded-2xl transition-all duration-300 relative z-10 ${currentTheme.headerBg}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#5B4EFF] flex items-center justify-center text-white font-black shadow-sm">
                    <Volume2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[11px] font-black capitalize leading-none">{assistantName || 'Echo'} AI</h3>
                    <p className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Audio
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border text-xs ${currentTheme.badgeBg}`}>
                  Interactive
                </span>
              </div>

              <div className="relative my-auto flex items-center justify-center py-2 z-10">
                {isListening && (
                  <>
                    <div className="absolute w-32 h-32 rounded-full bg-[#5B4EFF]/20 animate-ping pointer-events-none" />
                    <div className="absolute w-36 h-36 rounded-full bg-[#5B4EFF]/10 animate-pulse pointer-events-none" />
                  </>
                )}
                
                <div className={`w-28 h-28 rounded-full ${currentTheme.orbBg} flex items-center justify-center transition-all duration-500 animate-orb animate-float`}>
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-6 h-6 text-white/90 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3 mb-1 z-10">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black tracking-tight">
                    Hello! I'm {assistantName || 'Echo'} AI
                  </h3>
                  <p className="text-[11px] font-medium opacity-75 max-w-[210px] mx-auto leading-relaxed">
                    Your smart voice assistant.<br />Ask anything about your website.
                  </p>
                </div>

                <div className="h-6 flex items-center justify-center gap-1 w-full">
                  {[35, 75, 45, 95, 60, 85, 40].map((height, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isListening ? `${currentTheme.barColor} animate-pulse` : 'bg-slate-400/30'
                      }`}
                      style={{
                        height: isListening ? `${height}%` : '20%',
                        animationDelay: `${i * 0.12}s`
                      }}
                    />
                  ))}
                </div>

                <p className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl w-full text-center transition-all duration-300 ${currentTheme.statusBg}`}>
                  {voiceStatus}
                </p>
              </div>

              <div className="z-10 pb-1">
                <button
                  onClick={toggleVoiceAssistant}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isListening ? currentTheme.micActive : currentTheme.micInactive
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-5 h-5 animate-pulse" />
                  ) : (
                    <MicOff className="w-5 h-5 opacity-70" />
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* TOOL CALLING & EMBED CODE SECTION */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-6 sm:p-10 rounded-3xl bg-white/60 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/60 text-[11px] font-bold text-[#5B4EFF] shadow-sm">
                <Zap className="w-3.5 h-3.5" /> Autonomous Tool Execution
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A]">
                More Than Chat.<br />
                Your Agent Takes Direct Action.
              </h2>

              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                Traditional chatbots only repeat text responses. WebMate AI agents invoke structured functions to perform business tasks on behalf of your visitors.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Calendar className="w-5 h-5 text-[#5B4EFF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Appointment Booking</h4>
                    <p className="text-[11px] text-slate-500">Connect Calendly, Google Calendar, or custom booking endpoints.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <UserPlus className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Lead Capture & CRM</h4>
                    <p className="text-[11px] text-slate-500">Extract visitor contact info and pipe structured JSON directly to MongoDB or Webhooks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Globe2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">External API Triggers</h4>
                    <p className="text-[11px] text-slate-500">Perform real-time database lookups, order status tracking, or auth checks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-5 rounded-2xl bg-slate-900 shadow-xl space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#5B4EFF]" /> Embed Code Snippet
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {sampleEmbedCode}
                </pre>

                <p className="text-[11px] font-semibold text-slate-400">
                  ⚡ Paste this single script snippet before `&lt;/body&gt;` on any website.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-white/60 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.03)] text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A]">
            Ready to Supercharge Your Website Support?
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-xl mx-auto">
            Build your first voice and chat AI agent in under 5 minutes with our builder console.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/builder')}
              className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B4EFF] to-[#6355FF] shadow-[0_10px_25px_rgba(91,78,255,0.3)] hover:shadow-[0_14px_30px_rgba(91,78,255,0.4)] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Launch Builder Console</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;