"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, User, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { DitherShader } from "@/components/ui/dither-shader";

// Standard SVG for GitHub icon
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate registration process before redirecting
    // In a real app, this would hit /api/auth/register
    setTimeout(() => {
      // Auto login mock
      setIsLoading(false);
      router.push("/login?registered=true");
    }, 1500);
  };

  const handleGithubLogin = () => {
    setIsLoading(true);
    signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-nexus-primary/30">
      <div className="w-full max-w-[1200px] flex flex-row-reverse rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(139,92,246,0.1)] relative bg-black/40 backdrop-blur-3xl min-h-[700px]">
        {/* Background ambient glow inside the box */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] pointer-events-none rounded-full" />

        {/* Right Panel: Aesthetic Frame (Reversed) */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 border-l border-white/10 overflow-hidden">
          {/* Parallax Shader Background overlaying this half */}
          <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none">
             <DitherShader
               src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3540&auto=format&fit=crop"
               gridSize={3}
               colorMode="duotone"
               primaryColor="#000000"
               secondaryColor="#0a4387"
               animated={true}
               animationSpeed={0.01}
               className="w-full h-full object-cover"
             />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/80 to-black z-0 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-end gap-3">
            <span className="text-xl font-playfair font-bold tracking-widest text-white/90">
              NEXUSOPS
            </span>
            <Link href="/">
              <div className="w-10 h-10 bg-black/50 border border-blue-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md">
                <TerminalSquare className="w-5 h-5 text-blue-400" />
              </div>
            </Link>
          </div>

          <div className="relative z-10 mb-20 text-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-text-muted text-xs font-mono tracking-widest mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              NEW_NODE_DETECTION
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-playfair font-bold text-white leading-tight"
            >
              Become<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-nexus-primary italic">Omniscient</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-text-secondary font-display text-sm leading-relaxed max-w-sm ml-auto"
            >
              Registering an identity assigns you access keys to the Dual-Cockpit infrastructure.
            </motion.p>
          </div>
        </div>

        {/* Left Panel: Interactive Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center relative z-10 bg-[#060606] p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md mx-auto">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-playfair font-bold text-white tracking-wide">
                Register
              </h2>
              <Link href="/login" className="text-sm font-display text-text-muted hover:text-white transition-colors">
                &larr; Already Active
              </Link>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs tracking-wider"
                >
                  &gt; {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-text-muted group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                    placeholder="System Designation"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-text-muted group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                    placeholder="sys.admin@nexus.io"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-text-muted group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all items-center gap-2 relative overflow-hidden group disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <span className="relative z-10 flex items-center gap-2 font-display tracking-wide">
                    Create Identity <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px w-full bg-white/10" />
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest whitespace-nowrap">Or Deploy Via</span>
              <div className="h-px w-full bg-white/10" />
            </div>

            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="mt-6 w-full flex justify-center py-3.5 px-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm font-medium text-white transition-all items-center gap-3 disabled:opacity-50 shadow-sm font-display tracking-wide"
            >
              <GithubIcon className="w-5 h-5 opacity-80" />
              Sync GitHub Identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
