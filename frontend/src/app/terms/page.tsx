import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">
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
                INTERVIEW AI
              </span>
              <span className="text-[10px] font-lexend font-bold text-zinc-500 uppercase tracking-widest ml-7">Learn skills Get placed</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-lexend font-medium text-zinc-700">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <Link href="/programs" className="hover:text-red-600 transition-colors">Programs</Link>
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

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto flex-1">
        <h1 className="text-4xl font-outfit font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-zinc font-lexend text-zinc-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold text-[#111] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using Interview AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <h2 className="text-2xl font-bold text-[#111] mt-8 mb-4">2. Description of Service</h2>
          <p>Interview AI provides AI-powered mock interviews, coding assessments, and related career preparation tools.</p>
          <h2 className="text-2xl font-bold text-[#111] mt-8 mb-4">3. User Conduct</h2>
          <p>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>
          <p className="mt-12 text-sm">For detailed inquiries, please contact us via the Contact page.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-white py-16 px-6 border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-2xl font-outfit font-extrabold tracking-tight flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-2 text-[#f03b22]">
                <path d="M4 12L12 4L20 12M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              INTERVIEW AI
            </span>
            <span className="text-[10px] font-lexend font-bold text-zinc-400 uppercase tracking-widest md:ml-8">Learn skills Get placed</span>
          </div>
          <div className="flex gap-6 font-lexend text-sm text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white">Terms of Service</Link>
            <Link href="/contact.html" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
