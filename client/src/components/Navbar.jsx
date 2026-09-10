import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, 
  Wrench, 
  LogOut, 
  Sparkles,
  ChevronDown,
  User,
  Mail,
  ShieldCheck,
  Building
} from 'lucide-react';
import logo from '../assets/logo.svg';
import axios from 'axios';
import { serverURL } from '../App';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Navigation Handlers
  const handleHomeClick = () => {
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleBuilderClick = () => {
    setIsDropdownOpen(false);
    navigate('/builder');
  };
  
  const handleBillingClick = () => {
    setIsDropdownOpen(false);
    navigate('/billing');
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/logout`, { withCredentials: true });
      setUser(null);
      toast.success("Logged out successfully 👋");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User details derived strictly from prop
  const fullName = user?.displayName || user?.name || '';
  const firstName = fullName ? fullName.split(' ')[0] : '';
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : 'U';
  const userEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f0f3f9] backdrop-blur-md border-b border-white/60 shadow-[0_10px_20px_-5px_rgba(163,177,198,0.35)] font-sans antialiased text-slate-900">
      <div className="w-full px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleHomeClick}
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0 p-1.5 sm:p-2 rounded-2xl bg-[#f0f3f9] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] transition-all duration-300"
        >
          <div className="relative flex items-center justify-center p-1 sm:p-1.5 rounded-xl bg-[#f0f3f9] shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] transition-all duration-500 group-hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 rounded-xl blur-md opacity-25 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
            <img 
              src={logo} 
              alt="WebMate AI Logo" 
              className="h-6 sm:h-8 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:rotate-[-4deg]" 
            />
          </div>

          <div className="flex flex-col pr-1">
            <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
              WebMate<span className="text-indigo-600 group-hover:animate-bounce inline-block">.ai</span>
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} /> Agentic Engine
            </span>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Glowing Neumorphic Builder Button */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition duration-300 animate-pulse" />
              <button
                onClick={handleBuilderClick}
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:bg-indigo-700 active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3)] transition-all duration-200 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-100 transition-transform duration-300 group-hover:rotate-12" />
                <span>Builder</span>
              </button>
            </div>

            {/* Neumorphic Billing Button */}
            <button
              onClick={handleBillingClick}
              className="group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-[#f0f3f9] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-indigo-600 active:shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] transition-all duration-200 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-transform duration-300 group-hover:scale-110" />
              <span>Billing</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300/60 mx-0.5 hidden md:block" />

          {/* User Profile Badge */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2.5 h-9 sm:h-11 px-2.5 sm:px-3 rounded-full bg-[#f0f3f9] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] transition-all duration-200 cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]">
                    {userInitial}
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-[#f0f3f9]"></span>
                  </span>
                </div>

                {/* Greeting Tag */}
                {firstName && (
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f3f9] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]">
                    <span className="text-xs transition-transform duration-300 group-hover:rotate-12 inline-block">👋</span>
                    <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate group-hover:text-indigo-600 transition-colors">
                      {firstName}
                    </span>
                  </div>
                )}

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'}`} />
              </button>

              {/* Neumorphic Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-[#f0f3f9] rounded-2xl shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/50 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Account Card */}
                  <div className="p-3 rounded-xl bg-[#f0f3f9] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {userInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <User className="w-3 h-3 text-indigo-600 shrink-0" />
                          {fullName || 'User Account'}
                        </p>
                        {userEmail && (
                          <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions Menu */}
                  <div className="md:hidden mt-2.5 space-y-1.5">
                    <button
                      onClick={handleBuilderClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-[#f0f3f9] rounded-xl shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] hover:text-indigo-600 transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Builder App</span>
                    </button>
                    <button
                      onClick={handleBillingClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-[#f0f3f9] rounded-xl shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] hover:text-indigo-600 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Billing & Subscription</span>
                    </button>
                  </div>

                  {/* Workspace Status */}
                  <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#f0f3f9] flex items-center justify-between text-[11px] font-medium text-slate-600 shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Personal Workspace</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-[#f0f3f9] px-2 py-0.5 rounded shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" /> {user.plan}
                    </span>
                  </div>

                  {/* Log Out Button */}
                  <button
                    onClick={handleLogout}
                    className="mt-2.5 w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-red-600 bg-[#f0f3f9] rounded-xl shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5 text-red-500 transition-transform group-hover:-translate-x-0.5" />
                      Log Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;