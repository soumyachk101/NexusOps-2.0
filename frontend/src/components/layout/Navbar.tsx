import Link from "next/link";
import { Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-4 inset-x-0 z-50 mx-auto max-w-5xl px-4 sm:px-6 transition-all duration-300 ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className={`relative flex items-center justify-between px-6 py-3 md:py-4 rounded-full transition-all duration-500 overflow-hidden ${
        isScrolled 
          ? "bg-bg-base/70 backdrop-blur-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "bg-transparent border border-transparent"
      }`}>
        {/* Glow Effect when scrolled */}
        {isScrolled && (
          <div className="absolute inset-0 bg-gradient-to-r from-nexus-primary/10 via-transparent to-blue-500/10 pointer-events-none" />
        )}

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-nexus-primary/20 to-blue-500/10 rounded-xl border border-nexus-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Activity className="w-5 h-5 text-nexus-primary" />
          </div>
          <span className="text-xl md:text-2xl font-playfair font-bold text-white tracking-widest hidden sm:block">
            NEXUS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 relative z-10">
          <Link href="#architecture" className="text-sm font-display font-medium text-text-secondary hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="#features" className="text-sm font-display font-medium text-text-secondary hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#faq" className="text-sm font-display font-medium text-text-secondary hover:text-white transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <Link 
            href="/login" 
            className="text-sm font-display font-medium text-text-secondary hover:text-white transition-colors hidden sm:block"
          >
            Terminal Login
          </Link>
          <Link 
            href="/login" 
            className="relative group bg-white hover:bg-gray-200 text-bg-base font-playfair text-xs px-5 py-2.5 rounded-full border border-white transition-all overflow-hidden"
          >
            <span className="relative z-10 tracking-wider">INITIATE</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
