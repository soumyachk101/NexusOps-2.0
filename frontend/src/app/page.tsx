"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Shield, Zap, GitPullRequest, Database, TerminalSquare } from "lucide-react";
import { DitherShader } from "@/components/ui/dither-shader";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RevealText } from "@/components/ui/RevealText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AutoFixSimulator } from "@/components/landing/widgets/AutoFixSimulator";
import { SystemHealthRadar } from "@/components/landing/widgets/SystemHealthRadar";
import { DeepMemoryNetwork } from "@/components/landing/widgets/DeepMemoryNetwork";
import { OperationalTerminal } from "@/components/landing/widgets/OperationalTerminal";

const features = [
  {
    name: "AI-Powered AutoFix",
    description: "Automatically detect and suggest fixes for incidents before they impact users.",
    icon: Zap,
    component: AutoFixSimulator,
    size: "lg"
  },
  {
    name: "Deep Memory Context",
    description: "NexusOps remembers every PR, bug, and architectural decision.",
    icon: Database,
    component: DeepMemoryNetwork,
    size: "sm"
  },
  {
    name: "Intelligent Triage",
    description: "Prioritize issues instantly using our proprietary severity scoring algorithm.",
    icon: Shield,
    component: SystemHealthRadar,
    size: "sm"
  },
  {
    name: "Operational Feed",
    description: "Real-time visibility into the system's decision-making process.",
    icon: TerminalSquare,
    component: OperationalTerminal,
    size: "md"
  },
];

const faqs = [
  {
    question: "How does the AutoFix Engine intercept production errors?",
    answer: "NexusOps integrates directly into your logging cluster. When an anomaly is detected, the engine cross-references your entire GitHub history to suggest a highly-probable root cause patch instantly.",
  },
  {
    question: "Is NexusOps compliant with SOC2 and enterprise security?",
    answer: "Yes. We designed the architecture to evaluate telemetry metadata without exposing raw PII or secure environment variables. Enterprise deployments can also be completely self-hosted.",
  },
  {
    question: "Do you support bitbucket and Gitlab?",
    answer: "Currently, deep GitHub integration natively ships with NexusOps V2. GitLab and Bitbucket support are in private beta for our enterprise tier.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Parallax setup for background
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yHeroText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityShader = useTransform(scrollYProgress, [0, 0.5], [1, 0.2]);

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden selection:bg-nexus-primary/30 selection:text-white">
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-nexus-primary z-[100] origin-left"
        style={{ scaleX }}
      />
      
      <Navbar />

      {/* Hero Section */}
      <div 
        ref={containerRef}
        className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Sophisticated Background Aura */}
        <motion.div 
          style={{ opacity: opacityShader, y: yBg }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C9B6FF]/15 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-[#A7C6FF]/15 blur-[120px] rounded-full" />
        </motion.div>
        
        {/* Gradient Fade */}
        <div className="absolute inset-0 bg-bg-base/40 z-0 pointer-events-none" />
        
        {/* Hero Content - Asymmetric & Unique */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-20">
          <motion.div
            style={{ y: yHeroText }}
            className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start"
          >
            {/* Left Side: Typography */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-text-secondary text-[11px] font-medium tracking-wide mb-8">
                  <span className="w-1.5 h-1.5 bg-nexus-primary rounded-full animate-pulse" />
                  Nexus v2.4 Now Available
                </div>
              </motion.div>

              <div className="overflow-hidden">
                <RevealText>
                  <motion.h1 
                    className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1] mb-6"
                  >
                    Automated Incident 
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-primary to-blue-400">
                      Intelligence.
                    </span>
                  </motion.h1>
                </RevealText>
              </div>

              <RevealText delay={0.2}>
                <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-text-secondary leading-relaxed mb-10">
                  Resolve production issues before they impact your users. Nexus combines deep codebase context with real-time operational metrics to automate your triage workflow.
                </p>
              </RevealText>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white bg-nexus-primary hover:bg-nexus-hover transition-all rounded-lg shadow-lg shadow-nexus-primary/20"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-text-primary bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-lg"
                >
                  View Documentation
                </Link>
              </motion.div>
            </div>

            {/* Right Side: Animated Code Editor Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex-1 w-full max-w-lg lg:max-w-none relative perspective-1000 hidden md:block"
            >
              {/* Ultra-premium backdrop glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-nexus-primary/30 to-transparent blur-3xl rounded-[2rem] opacity-70 animate-pulse" />
              <div className="relative border border-white/[0.08] bg-[#000000]/60 backdrop-blur-2xl rounded-2xl shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden">
                
                {/* Minimalist MacOS Header */}
                <div className="flex items-center px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#FF5F56] transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#FFBD2E] transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#27C93F] transition-colors" />
                  </div>
                </div>

                {/* Editor Body */}
                <div className="p-5 font-mono text-[13px] leading-relaxed overflow-hidden relative">
                  
                  {/* Subtle Grid Background in Editor */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex text-text-muted/40 mb-1">
                      <span className="w-6 text-right mr-4 select-none">12</span>
                      <span className="text-purple-400">async function</span>
                      <span className="text-blue-400 ml-2">fetchUserData</span>
                      <span className="text-white/80">(req, res) {"{"}</span>
                    </div>
                    
                    <div className="flex text-text-muted/40 mb-1">
                      <span className="w-6 text-right mr-4 select-none">13</span>
                      <span className="ml-4 text-pink-400">try</span>
                      <span className="text-white/80 ml-2">{"{"}</span>
                    </div>

                    {/* Flashing Deleted Line */}
                    <motion.div 
                      animate={{ opacity: [1, 1, 0, 0, 0] }}
                      transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
                      className="absolute w-full flex bg-red-500/10 border-l-[2px] border-red-500/50"
                    >
                      <span className="w-[18px] text-right mr-4 select-none text-red-500/40">14</span>
                      <span className="ml-2 text-white/40 line-through">const user = await db.query(req.params.id);</span>
                    </motion.div>

                    {/* Animated Inserted Line */}
                    <motion.div 
                      animate={{ opacity: [0, 0, 1, 1, 0] }}
                      transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
                      className="flex bg-nexus-primary/10 border-l-[2px] border-nexus-primary shadow-[inset_20px_0_40px_rgba(139,92,246,0.1)]"
                    >
                      <span className="w-[18px] text-right mr-4 select-none text-nexus-primary/60">14</span>
                      <motion.span
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                        className="ml-2 whitespace-nowrap overflow-hidden inline-block font-medium"
                      >
                        <span className="text-blue-400">const</span><span className="text-white/90"> user = </span><span className="text-pink-400">await</span><span className="text-white/90"> db.users.</span><span className="text-emerald-400">findUnique</span><span className="text-white/90">({"{ "}id: req.params.id {"}"});</span>
                      </motion.span>
                    </motion.div>

                    {/* Artificial padding to match line height since above are absolute/swapped */}
                    <div className="h-5" />

                    <div className="flex text-text-muted/40 mt-1">
                      <span className="w-6 text-right mr-4 select-none">15</span>
                      <span className="ml-8 text-pink-400">return</span>
                      <span className="text-white/80 ml-2">res.status(</span>
                      <span className="text-orange-400">200</span>
                      <span className="text-white/80">).json(user);</span>
                    </div>

                    <div className="flex text-text-muted/40 mt-1">
                      <span className="w-6 text-right mr-4 select-none">16</span>
                      <span className="ml-4 text-white/80">{"} "}</span>
                      <span className="text-pink-400">catch</span>
                      <span className="text-white/80 ml-2">(err) {"{"}</span>
                    </div>
                  </div>

                  {/* AutoFix Popup Toast inside Editor */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: [20, 0, 0, 20], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl border border-nexus-primary/30 text-white/90 text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-2xl z-20"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-nexus-primary animate-pulse" />
                    <span className="font-display">AutoFix execution complete</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 bg-bg-base relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-left mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10"
          >
            <div>
              <h2 className="text-3xl font-semibold text-white mb-4">
                Platform Capabilities
              </h2>
            </div>
            <p className="text-sm text-text-secondary max-w-sm md:text-right border-l md:border-l-0 md:border-r border-white/10 pl-4 md:pl-0 md:pr-4 py-2">
              Everything you need to resolve incidents faster and maintain high-availability systems, packaged in a meticulously crafted interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1, 
                    ease: [0.33, 1, 0.68, 1] 
                }}
                className={`
                  p-1 bg-bg-surface border border-white/5 hover:border-nexus-primary/50 transition-all duration-300 group relative overflow-hidden flex flex-col
                  ${feature.size === 'lg' ? 'md:col-span-6 lg:col-span-8' : ''}
                  ${feature.size === 'md' ? 'md:col-span-3 lg:col-span-4' : ''}
                  ${feature.size === 'sm' ? 'md:col-span-3 lg:col-span-4' : ''}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-nexus-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-nexus-primary/40 group-hover:bg-nexus-primary/10 transition-all duration-300">
                        <feature.icon className="w-4 h-4 text-nexus-primary/80 group-hover:text-nexus-primary transition-colors" />
                      </div>
                      <span className="text-text-muted font-playfair text-[10px] tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                        MODULE_0{index + 1}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-playfair font-bold text-white mb-2 tracking-wider uppercase group-hover:text-nexus-primary transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-xs font-display text-text-secondary leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    {/* Widget Display Area */}
                    <div className="mt-auto flex-1 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                      <feature.component />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section with AutoFix aesthetic */}
      <section id="faq" className="py-24 relative z-10 border-t border-white/5 bg-bg-base overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nexus-primary/5 via-transparent to-transparent z-0 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col md:flex-row gap-16">
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl font-playfair font-bold text-white mb-4 tracking-widest uppercase border-l-2 border-nexus-primary pl-4">
              INTEL / <span className="text-nexus-primary">FAQ</span>
            </h2>
            <p className="text-text-secondary font-display text-sm leading-relaxed border-l border-white/10 pl-4">
              Answers to our system deployment architecture and enterprise requirements.
            </p>
          </div>

          <div className="w-full md:w-2/3">
            <Accordion type="single" collapsible className="w-full font-display">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/10 border-b py-2">
                  <AccordionTrigger className="text-left text-white hover:text-nexus-primary hover:no-underline transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-text-secondary leading-relaxed font-light pt-2 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
