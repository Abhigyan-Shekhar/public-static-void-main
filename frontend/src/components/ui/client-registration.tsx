"use client"
import { useState, useEffect } from "react";
import {
  Home,
  Monitor,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  Bell,
  Settings,
  HelpCircle,
  User,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "./gradient-button";
import { ShaderAnimation } from "./shader-animation";

export const ClientRegistration = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#030712'; // Tailwind gray-950
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <RegistrationContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Registration");

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Monitor}
          title="Cases"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={5}
        />
        <Option
          Icon={Tag}
          title="Evidence Review"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={12}
        />
        <Option
          Icon={BarChart3}
          title="Scoring"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={UserPlus}
          title="Registration"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Bell}
          title="Announcements"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Users}
          title="Referrals"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={2}
        />
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title="Help & Support"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

interface OptionProps {
  Icon: any;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
}
const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
  const isSelected = selected === title;
  
  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }: { open: boolean }) => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Beyond Borders
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Authority Dashboard
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        />
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        />
      </svg>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

interface RegistrationContentProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const RegistrationContent = ({ isDark, setIsDark }: RegistrationContentProps) => {
  const [fullName, setFullName] = useState("");
  const [intakeLocation, setIntakeLocation] = useState("");
  const [agency, setAgency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { createCase } = await import("../../lib/api");
      const created = await createCase({
        person: {
          name: fullName.trim(),
        },
        status: "intake_created",
        intake_location: intakeLocation || undefined,
        owner_agency: agency || undefined,
      });
      setResult({ ok: true, message: `Case created: ${(created as any).case_code ?? (created as any).id}` });
      setFullName("");
      setIntakeLocation("");
      setAgency("");
    } catch (err: any) {
      setResult({ ok: false, message: err.message ?? "Failed to create case." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.14]">
          <ShaderAnimation className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/95 via-gray-50/84 to-gray-50/96 dark:from-gray-950/95 dark:via-gray-950/84 dark:to-gray-950/97" />
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Client Registration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Enroll a new person into the identity system.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/" className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`relative z-10 mb-4 px-4 py-3 rounded-lg text-sm font-medium ${result.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.message}
        </div>
      )}

      {/* Registration Form Card */}
      <div className="relative z-10 max-w-4xl rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please enter the individual's primary details.</p>
        </div>

        <form className="p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   Full Name <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="text"
                   required
                   value={fullName}
                   onChange={e => setFullName(e.target.value)}
                   placeholder="e.g. Ahmad Karimi"
                   className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   Intake Location
                 </label>
                 <input
                   type="text"
                   value={intakeLocation}
                   onChange={e => setIntakeLocation(e.target.value)}
                   placeholder="e.g. Camp Delta"
                   className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                 />
               </div>
             </div>

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   Owner Agency
                 </label>
                 <input
                   type="text"
                   value={agency}
                   onChange={e => setAgency(e.target.value)}
                   placeholder="e.g. UNHCR"
                   className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                 />
               </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <GradientButton
              type="submit"
              className="px-6 py-2.5 rounded-lg"
              disabled={submitting || !fullName.trim()}
            >
              {submitting ? "Creating…" : "Register Client"}
            </GradientButton>
          </div>
        </form>
      </div>

    </div>
  );
};
