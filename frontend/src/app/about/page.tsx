import Link from "next/link";
import { CheckCircle2, Code2, LineChart, Target, Rocket, Shield, Users, Sparkles, Server, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-lexend { font-family: 'Lexend', sans-serif; }
      `}} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-outfit font-extrabold text-red-600 tracking-tight flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                  <path d="M4 12L12 4L20 12M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                CRACKLY
              </span>
              <span className="text-[10px] font-lexend font-bold text-zinc-500 uppercase tracking-widest ml-7">Learn skills Get placed</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-lexend font-medium text-zinc-700">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <Link href="/programs" className="hover:text-red-600 transition-colors">Programs</Link>
            <Link href="/about" className="text-red-600 font-semibold">About us</Link>
            <Link href="/#contact" className="hover:text-red-600 transition-colors">Contact us</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 text-[15px] font-lexend font-medium text-zinc-700 hover:text-black border border-zinc-200 rounded-md transition-colors hidden sm:block">
              Login
            </Link>
            <Link href="/contact.html" className="px-5 py-2.5 text-[15px] font-lexend font-medium bg-[#f03b22] hover:bg-[#d62f1a] text-white rounded-md transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-6 bg-zinc-50/50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#f03b22] font-lexend font-bold text-sm tracking-wide uppercase mb-6">About Crackly</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-outfit font-extrabold text-[#111] mb-8 leading-tight tracking-tight">
            Empowering Candidates with <br className="hidden md:block" />AI-Driven Interview Prep
          </h1>
          <p className="text-lg md:text-xl font-lexend text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            We bridge the gap between learning and employment with intelligent, practical, and highly personalized mock interviews designed to make you placement-ready.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 font-lexend font-medium bg-[#f03b22] text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 text-lg">
            Start Practicing Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Identity Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] mb-6 tracking-tight">
              Building Careers Through Intelligent Learning
            </h2>
            <div className="space-y-6 font-lexend text-zinc-600 text-lg leading-relaxed">
              <p>
                Crackly is a modern platform committed to empowering students and professionals with real-time feedback, simulated interviews, and career-ready expertise.
              </p>
              <p>
                In today's competitive job market, standard preparation isn't enough. We emphasize AI-driven mock interviews that mirror real workplace technical rounds, ensuring our learners are confident from day one.
              </p>
              <p>
                With a focus on global tech standards, we prepare candidates not just for passing tests, but for thriving in high-stakes technical discussions.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80" 
              alt="Tech professional coding" 
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f03b22] font-lexend font-bold text-sm tracking-wide uppercase mb-3">Purpose & Direction</p>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] tracking-tight">
              Our Mission & Vision
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-10 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="w-14 h-14 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-outfit font-bold text-[#111] mb-6">Our Mission</h3>
              <ul className="space-y-4 font-lexend text-zinc-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Deliver high-quality AI-driven feedback aligned with global industry standards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Create job-ready professionals through realistic mock interviews.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Bridge the gap between formal education and technical hiring expectations.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-10 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="w-14 h-14 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <Rocket size={28} />
              </div>
              <h3 className="text-2xl font-outfit font-bold text-[#111] mb-6">Our Vision</h3>
              <ul className="space-y-4 font-lexend text-zinc-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Become a globally recognized platform that sets new benchmarks in interview prep.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Democratize access to premium technical interviewing feedback.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#f03b22] shrink-0" />
                  <span>Pioneer AI education that transforms tech careers worldwide.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f03b22] font-lexend font-bold text-sm tracking-wide uppercase mb-3">Our Platform</p>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] tracking-tight">
              What We Offer
            </h2>
            <p className="text-zinc-500 font-lexend mt-4 max-w-2xl mx-auto text-lg">
              Comprehensive AI-powered tools designed to meet diverse learning needs and career goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
              <Cpu className="w-10 h-10 text-[#f03b22] mb-6" />
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">AI Mock Interviews</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Interactive voice and chat-based interviews powered by advanced LLMs to simulate real technical rounds.</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
              <Code2 className="w-10 h-10 text-[#f03b22] mb-6" />
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">Coding Assessments</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">DSA practice, logical constraints, and code execution environments exactly like top product companies.</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
              <LineChart className="w-10 h-10 text-[#f03b22] mb-6" />
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">Performance Analytics</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Detailed feedback on your answers, time complexity analysis, and actionable insights to improve.</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
              <Server className="w-10 h-10 text-[#f03b22] mb-6" />
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">System Design</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">High-level architecture tests and design patterns practice for senior and mid-level software roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-white py-16 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-2xl font-outfit font-extrabold tracking-tight flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-2 text-[#f03b22]">
                <path d="M4 12L12 4L20 12M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CRACKLY
            </span>
            <span className="text-[10px] font-lexend font-bold text-zinc-400 uppercase tracking-widest md:ml-8">Learn skills Get placed</span>
          </div>
          <div className="flex gap-6 font-lexend text-sm text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact.html" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
