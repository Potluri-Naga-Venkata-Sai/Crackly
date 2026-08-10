import Link from "next/link";
import { CheckCircle2, Bot, Code2, LineChart, Cpu, Mic, BrainCircuit } from "lucide-react";

export default function ProgramsPage() {
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
            <Link href="/programs" className="text-red-600 font-semibold">Programs</Link>
            <Link href="/about" className="hover:text-red-600 transition-colors">About us</Link>
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
      <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-6 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#f03b22] font-lexend font-bold text-sm tracking-wide uppercase mb-6">Our Programmes</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-outfit font-extrabold text-[#111] mb-8 leading-tight tracking-tight">
            Build skills that get you hired
          </h1>
          <p className="text-lg md:text-xl font-lexend text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Industry aligned practice modules with AI mentor guidance, and placement support. Pick a track below to explore your customized career path.
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f03b22] font-lexend font-bold text-sm tracking-wide uppercase mb-3">Why candidates trust Crackly</p>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] tracking-tight">
              Training built for outcomes, not just certificates
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="w-12 h-12 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">AI Mentor Guided</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Get real-time feedback and hints on your code from our advanced AI mentor.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">Realistic Mocks</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Voice and chat-based interviews that simulate the pressure of a real technical round.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">End to end prep</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Resume parsing, logical puzzles, DSA, and system design built into every track.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-red-50 text-[#f03b22] rounded-xl flex items-center justify-center mb-6">
                <LineChart size={24} />
              </div>
              <h3 className="text-xl font-outfit font-bold text-[#111] mb-3">Detailed Analytics</h3>
              <p className="text-zinc-600 font-lexend leading-relaxed text-sm">Track your progress and pinpoint exactly which areas need more practice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Tracks */}
      <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] tracking-tight mb-4">
              Choose your career track
            </h2>
            <p className="text-zinc-500 font-lexend max-w-2xl mx-auto text-lg">
              Six specialised practice modules, each equipped with its own AI mentor, realistic questions, and performance tracking.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Track 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=82" alt="Full Stack" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Development</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">Full Stack Development</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">React, Node, databases, and deployment the way teams build products today.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">React</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Node.js</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">MongoDB</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Track 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=82" alt="Data Science" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Data & AI</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">Data Science</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">Python, SQL, and ML basics so your data tells a clear story in interviews.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Python</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Pandas</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">SQL</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Track 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=82" alt="AI and ML" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Data & AI</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">AI and Machine Learning</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">Strong ML foundations and practical pipelines you can showcase to recruiters.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">PyTorch</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">TensorFlow</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">MLOps</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Track 4 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=82" alt="Gen AI" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Data & AI</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">Generative AI</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">LLMs, prompts, and small apps you can demo in interviews.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">LLMs</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Prompting</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">RAG</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Track 5 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=82" alt="Aptitude" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Placement Prep</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">Aptitude Training</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">Quant, logic, and speed tricks for campus drives and corporate hiring tests.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Quantitative</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Logical</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Mock Tests</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Track 6 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=82" alt="Competitive Coding" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-lexend font-bold px-3 py-1.5 rounded-full text-zinc-800">Placement Prep</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-outfit font-bold text-[#111] mb-2">Competitive Coding</h3>
                <p className="text-zinc-600 font-lexend text-sm mb-6">DSA, contests, and interview patterns for top product company rounds.</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">DSA</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">DP</span>
                  <span className="text-xs font-lexend font-medium bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">Graphs</span>
                </div>
                <Link href="/login" className="flex items-center justify-between text-[#f03b22] font-lexend font-bold hover:gap-2 transition-all">
                  <span>Start Practicing</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-outfit font-bold text-[#111] mb-4 tracking-tight">
            We prepare you for the companies you want to crack
          </h2>
          <p className="text-lg font-lexend text-zinc-600">
            Our tests, mock interviews, and assessments mirror how global product companies actually hire.
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden bg-white py-10 flex">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex w-[200%] animate-marquee">
            <div className="flex w-1/2 justify-around items-center px-4">
              {companies.map((company, i) => (
                <div key={i} className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity mx-8 grayscale hover:grayscale-0" style={{'--hover-color': company.color} as any}>
                  <img src={company.src} alt={company.name} className="h-10 w-auto" />
                </div>
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center px-4">
              {companies.map((company, i) => (
                <div key={`dup-${i}`} className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity mx-8 grayscale hover:grayscale-0" style={{'--hover-color': company.color} as any}>
                  <img src={company.src} alt={company.name} className="h-10 w-auto" />
                </div>
              ))}
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
