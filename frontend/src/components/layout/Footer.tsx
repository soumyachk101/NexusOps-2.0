import Link from "next/link";
import { Activity, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-bg-base overflow-hidden pt-24 pb-12">
      {/* Background glow for Hacker aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-nexus-primary/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-nexus-primary/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-bg-surface border border-nexus-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <Activity className="w-5 h-5 text-nexus-primary" />
              </div>
              <span className="text-2xl font-playfair font-bold text-white tracking-widest uppercase">
                NEXUS<span className="text-nexus-primary opacity-80">OPS</span>
              </span>
            </Link>
            <p className="text-sm font-display text-text-secondary max-w-xs mb-6 leading-relaxed">
              The next-generation command center for engineering teams. Automate incident response, leverage architectural memory, and deploy with absolute confidence.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/soumyachk101/NexusOps-" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-bg-surface border border-white/5 flex items-center justify-center hover:bg-white/5 hover:border-nexus-primary/50 transition-all text-text-secondary hover:text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-bg-surface border border-white/5 flex items-center justify-center hover:bg-white/5 hover:border-nexus-primary/50 transition-all text-text-secondary hover:text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-playfair text-xs tracking-widest mb-6">PLATFORM</h4>
            <ul className="space-y-4 font-display text-sm">
              <li><Link href="#" className="text-text-secondary hover:text-nexus-primary transition-colors">AutoFix Engine</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-nexus-primary transition-colors">Memory Context</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-nexus-primary transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-nexus-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-nexus-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-playfair text-xs tracking-widest mb-6">RESOURCES</h4>
            <ul className="space-y-4 font-display text-sm">
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Community</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-playfair text-xs tracking-widest mb-6">COMPANY</h4>
            <ul className="space-y-4 font-display text-sm">
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Customers</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-text-secondary hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted font-playfair text-[10px] tracking-widest">
            © {new Date().getFullYear()} NEXUSOPS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-text-muted font-playfair text-[10px]">
            <Terminal className="w-3 h-3" />
            <span>SYSTEM STATUS: <span className="text-green-500 font-bold">OPTIMAL</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
