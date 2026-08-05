"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Code2, Database, Layers, BrainCircuit, LineChart, Brain } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    "Build real projects, practise mock interviews, and get portfolio support so you speak clearly and confidently with recruiters.",
    "We help you move from a blank CV to a simple story: what you built, how you think, and why you fit the role.",
    "For universities, we bring the same structured training on campus. Your students stay focused on their degree, not random online content.",
    "Choose a track in Full Stack, Data Science, AI and ML, or Generative AI. Each one matches what hiring teams look for today.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleProgramSelect = (programName: string) => {
    sessionStorage.setItem("intended_program", programName);
    router.push("/login");
  };

  const programs = [
    {
      id: "Full Stack Development",
      title: "Full Stack Development",
      desc: "React, Node, databases, and deployment the way teams build products today.",
      points: [
        "APIs, auth, and Git workflow with mentor code reviews",
        "Capstone project plus interview practice on your own codebase"
      ],
      length: "5 to 7 months",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Data Science",
      title: "Data Science",
      desc: "Python, SQL, and ML basics so your data tells a clear story.",
      points: [
        "Data cleaning, charts, and simple models recruiters recognise",
        "Mini projects you can show on GitHub or in your portfolio"
      ],
      length: "5 to 6 months",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "AI and Machine Learning",
      title: "AI and Machine Learning",
      desc: "Strong ML foundations and practical pipelines you can show on your CV.",
      points: [
        "Hands on notebooks and habits that match team workflows",
        "Build systems that move from raw data to predictions"
      ],
      length: "6+ months",
      img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Generative AI",
      title: "Generative AI",
      desc: "LLMs, prompts, and small apps you can demo in interviews.",
      points: [
        "Focus on tools like OpenAI, LangChain, and vector databases",
        "Small assistants you can demo with real examples"
      ],
      length: "3 to 5 months",
      img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Aptitude Training",
      title: "Aptitude Training",
      desc: "Quant, logic, and speed tricks for campus drives and corporate hiring tests.",
      points: [
        "Syllabus mapped to real placement papers and mock test series",
        "Daily practice with performance analytics on weak areas"
      ],
      length: "3 to 6 months",
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Competitive Coding",
      title: "Competitive Coding",
      desc: "DSA, contests, and interview patterns for top product company rounds.",
      points: [
        "Weekly timed contests and live problem solving sessions",
        "Pattern based DSA curriculum for top company interviews"
      ],
      length: "3 to 6 months",
      img: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
    }
  ];

  const companies = [
    { name: "Google", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/google.svg", color: "#4285F4" },
    { name: "Microsoft", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/microsoft.svg", color: "#5E5E5E" },
    { name: "Amazon", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/amazon.svg", color: "#FF9900" },
    { name: "Meta", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/meta.svg", color: "#0866FF" },
    { name: "Netflix", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/netflix.svg", color: "#E50914" },
    { name: "Adobe", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/adobe.svg", color: "#FF0000" },
    { name: "Salesforce", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/salesforce.svg", color: "#00A1E0" },
    { name: "Stripe", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/stripe.svg", color: "#635BFF" },
    { name: "Spotify", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/spotify.svg", color: "#1DB954" },
    { name: "Atlassian", src: "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/atlassian.svg", color: "#0052CC" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-lexend { font-family: 'Lexend', sans-serif; }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-outfit font-extrabold text-red-600 tracking-tight flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                  <path d="M4 12L12 4L20 12M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                INTERVIEW AI
              </span>
              <span className="text-[10px] font-lexend font-bold text-zinc-500 uppercase tracking-widest ml-7">Learn skills Get placed</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-lexend font-medium text-zinc-700">
            <Link href="/" className="text-red-600 font-semibold">Home</Link>
            <Link href="#programs" className="hover:text-red-600 transition-colors">Programs</Link>
            <Link href="#about" className="hover:text-red-600 transition-colors">About us</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 text-[15px] font-lexend font-medium text-zinc-700 hover:text-black border border-zinc-200 rounded-md transition-colors">
              Login
            </Link>
            <Link href="/contact.html" className="px-5 py-2.5 text-[15px] font-lexend font-medium bg-[#f03b22] hover:bg-[#d62f1a] text-white rounded-md transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 max-w-xl">
            <p className="font-lexend font-semibold tracking-widest text-[#f03b22] text-sm mb-4 uppercase">
              For students and universities
            </p>
            <h1 className="font-outfit text-5xl md:text-[56px] font-bold leading-[1.1] text-[#111] mb-6 tracking-tight">
              From Campus to Corporate, We Make Students Job Ready
            </h1>
            
            <div className="relative min-h-[90px] mb-8">
              {slides.map((slide, index) => (
                <p 
                  key={index} 
                  className={`absolute top-0 left-0 text-lg font-lexend text-zinc-600 leading-relaxed transition-opacity duration-500 ${activeSlide === index ? 'opacity-100 relative' : 'opacity-0'}`}
                >
                  {slide}
                </p>
              ))}
            </div>

            <div className="flex gap-2 mb-10">
              {slides.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${activeSlide === index ? 'bg-[#f03b22]' : 'bg-zinc-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="#programs" className="px-7 py-3.5 font-lexend font-medium bg-[#d62f1a] text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
                Explore programs
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="aspect-[4/5] md:aspect-[3/4] w-full max-w-[500px] mx-auto overflow-hidden rounded-3xl relative">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80" 
                alt="Students studying together" 
                className="object-cover w-full h-full"
              />
            </div>
            
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-20 border-t border-zinc-100 bg-zinc-50/50 mt-10 md:mt-20">
        <div className="max-w-4xl mx-auto text-center px-6 mb-12">
          <h2 className="text-3xl md:text-[34px] font-outfit font-bold text-[#111] mb-4">
            We prepare you for the companies you want to crack
          </h2>
          <p className="text-[17px] font-lexend text-zinc-600">
            Our tests, projects, and interviews mirror how these teams actually hire, from global product companies to India's fastest growing startups.
          </p>
        </div>

        <div className="overflow-hidden w-full bg-white py-10 relative border-y border-zinc-100">
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-[200%] animate-marquee items-center">
            {/* First set */}
            <div className="flex w-1/2 justify-around items-center px-4">
              {companies.map((c, i) => (
                <div key={i} className="flex justify-center items-center h-16 w-32 border border-zinc-100 rounded-2xl mx-4 shadow-sm bg-white" title={c.name}>
                  <div 
                    className="w-10 h-10" 
                    style={{ backgroundColor: c.color, maskImage: `url('${c.src}')`, WebkitMaskImage: `url('${c.src}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }} 
                  />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex w-1/2 justify-around items-center px-4">
              {companies.map((c, i) => (
                <div key={i + 10} className="flex justify-center items-center h-16 w-32 border border-zinc-100 rounded-2xl mx-4 shadow-sm bg-white" title={c.name}>
                  <div 
                    className="w-10 h-10" 
                    style={{ backgroundColor: c.color, maskImage: `url('${c.src}')`, WebkitMaskImage: `url('${c.src}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 px-6 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <p className="font-lexend font-bold tracking-widest text-[#f03b22] text-sm mb-3 uppercase">
              ABOUT US
            </p>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] mb-6 tracking-tight">
              Building Careers Through Intelligent Learning
            </h2>
            <div className="space-y-6 font-lexend text-zinc-600 text-lg leading-relaxed mb-8">
              <p>
                Interview AI is a modern platform committed to empowering students and professionals with real-time feedback, simulated interviews, and career-ready expertise.
              </p>
              <p>
                In today's competitive job market, standard preparation isn't enough. We emphasize AI-driven mock interviews that mirror real workplace technical rounds, ensuring our learners are confident from day one.
              </p>
            </div>
            <Link href="/about" className="inline-flex items-center text-[15px] font-bold font-lexend text-[#f03b22] hover:text-[#d62f1a] transition-colors">
              Learn more about us <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
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

      {/* Programs Grid */}
      <section id="programs" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-lexend font-bold tracking-widest text-[#f03b22] text-sm mb-3 uppercase">
              OUR PROGRAMMES
            </p>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] mb-4">
              Pick your track
            </h2>
            <p className="text-[17px] font-lexend text-zinc-600 max-w-lg mx-auto">
              Six career tracks with one focus: skills you can prove, and support until you are interview ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((prog, idx) => (
              <div key={prog.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full cursor-pointer" onClick={() => handleProgramSelect(prog.id)}>
                <div className="h-64 overflow-hidden relative">
                  <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur px-2 py-0.5 rounded text-xs font-bold text-white">
                    0{idx + 1}
                  </div>
                  <img src={prog.img} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#f03b22]" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-[22px] font-outfit font-bold text-[#111] mb-2">{prog.title}</h3>
                  <p className="text-[15px] font-lexend text-zinc-600 font-medium mb-6">
                    {prog.desc}
                  </p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {prog.points.map((point, i) => (
                      <li key={i} className="flex items-start text-sm font-lexend text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f03b22] mt-2 mr-3 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[11px] font-bold font-lexend uppercase tracking-wider text-zinc-400">Typical Length</span>
                    <span className="text-sm font-bold font-lexend text-[#111]">{prog.length}</span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleProgramSelect(prog.id); }} 
                    className="flex items-center text-sm font-bold font-lexend text-[#f03b22] hover:text-[#d62f1a] transition-colors"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-lg font-lexend text-zinc-600 mb-6 max-w-2xl mx-auto">
              Select a track and get instant access to AI mentors, automated resume parsing, and tailored mock interviews.
            </p>
            <Link href="/programs" className="text-[15px] font-bold font-lexend text-[#111] underline hover:text-[#f03b22] transition-colors">
              All programmes
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="border-t border-zinc-100 bg-white py-12 text-center mt-auto">
        <p className="text-zinc-500 text-sm font-lexend font-medium">© 2026 InterviewAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
