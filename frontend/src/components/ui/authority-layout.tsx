"use client"
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Monitor, Tag, BarChart3, Users, ChevronsRight, GitCommit,
  Moon, Sun, Bell, User, BellRing
} from "lucide-react";
import { ShaderAnimation } from "./shader-animation";
import { clearSession, getSession } from "../../lib/auth";
import { applyTheme, getStoredTheme } from "../../lib/theme";
import { BrandLogo } from "./brand-logo";

export const AuthorityLayout = ({ 
  children, 
  title, 
  subtitle, 
  headerActions 
}: { 
  children: React.ReactNode; 
  title: string; 
  subtitle: string; 
  headerActions?: React.ReactNode;
}) => {
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    const stored = getStoredTheme();
    setIsDark(stored === "dark");
    applyTheme(stored);
  }, []);

  useEffect(() => {
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        
        {/* Sidebar */}
        <nav
          className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out z-20 ${
            open ? 'w-64' : 'w-16'
          } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col`}
        >
          {/* Brand */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 h-[72px] flex items-center">
            <Link to="/dashboard" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity overflow-hidden">
               <BrandLogo variant={isDark ? "light" : "dark"} compact size="xs" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-2 space-y-1 mt-4 flex-1 overflow-y-auto hide-scrollbar">
             <Option Icon={Home} label="Dashboard" to="/dashboard" currentPath={location.pathname} open={open} />
             <Option Icon={Monitor} label="Cases" to="/cases" currentPath={location.pathname} open={open} notifs={35} />
             <Option Icon={GitCommit} label="Case Timeline" to="/timeline" currentPath={location.pathname} open={open} />
             <Option Icon={Tag} label="Evidence Review" to="/evidence" currentPath={location.pathname} open={open} notifs={12} />
             <Option Icon={BarChart3} label="Manual Verification" to="/scoring" currentPath={location.pathname} open={open} />
             <Option Icon={BellRing} label="Announcements" to="/announcements" currentPath={location.pathname} open={open} />
             <Option Icon={Users} label="Referrals" to="/referrals" currentPath={location.pathname} open={open} notifs={7} />
          </div>

          {/* Bottom Toggle */}
          <button 
            onClick={() => setOpen(!open)} 
            className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center p-3 h-14">
              <div className="grid size-8 shrink-0 place-content-center">
                <ChevronsRight className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${open ? "rotate-180" : ""}`} />
              </div>
              {open && <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Collapse Sidebar</span>}
            </div>
          </button>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-visible">
            
            {/* Top Header */}
            <header className="relative z-40 flex-shrink-0 flex items-center justify-between overflow-visible px-6 lg:px-8 h-[72px] border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 backdrop-blur-sm w-full">
               <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
               </div>
               <div className="flex items-center gap-3">
                  {headerActions && (
                    <div className="mr-2 flex items-center">
                      {headerActions}
                    </div>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications((value) => !value);
                        setShowProfileMenu(false);
                      }}
                      className="relative p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                    <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden z-[90]">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</div>
                        </div>
                        <div className="p-3 space-y-3">
                          {[
                            "12 evidence items are waiting for officer review.",
                            "2 new announcements were posted this morning.",
                            "Partner desk updated one referral status.",
                          ].map((item) => (
                            <div key={item} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setIsDark(!isDark)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {isDark ? <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" /> : <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                  </button>
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowProfileMenu((value) => !value);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block mr-1">
                        {session?.displayName ?? "Officer"}
                      </span>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden z-[90]">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{session?.displayName ?? "Officer"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{session?.username ?? "authority"}</div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              clearSession();
                              window.location.href = "/";
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </header>
            
            {/* Scrollable Page Space */}
            <main className="relative z-0 min-h-0 flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-950/50 p-6 lg:p-8">
               <div className="pointer-events-none absolute inset-0 overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.16]">
                   <ShaderAnimation className="h-full w-full" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-b from-gray-50/92 via-gray-50/78 to-gray-50/95 dark:from-gray-950/94 dark:via-gray-950/82 dark:to-gray-950/96" />
               </div>
               <div className="relative z-10 max-w-7xl mx-auto w-full pb-12">
                 {children}
               </div>
            </main>

        </div>
      </div>
    </div>
  );
};

const Option = ({ Icon, label, to, currentPath, open, notifs }: any) => {
  const isSelected = currentPath.startsWith(to) || (to === '/dashboard' && currentPath === '/dashboard');
  
  return (
    <Link
      to={to}
      className={`relative flex h-[42px] w-full items-center rounded-lg transition-all duration-200 border border-transparent ${
        isSelected 
          ? "bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400" 
          : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-[42px] shrink-0 place-content-center">
        <Icon className={`h-[18px] w-[18px] ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`} />
      </div>
      
      {open && (
        <span className={`text-sm tracking-wide ${isSelected ? 'font-semibold' : 'font-medium'}`}>{label}</span>
      )}

      {notifs && open && (
        <span className="absolute right-2.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-[10px] text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
          {notifs}
        </span>
      )}
    </Link>
  );
};
