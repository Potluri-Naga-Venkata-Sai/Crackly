import React from 'react';
import Link from 'next/link';

export function ContactUs() {
  return (
    <section className="py-24 bg-background border-t border-border/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-[13px] font-bold font-lexend tracking-widest uppercase text-blue-500 mb-3">
            GET IN TOUCH
          </p>
          <h2 className="text-3xl md:text-4xl font-outfit font-bold text-foreground mb-4">
            Contact Us
          </h2>
          <p className="text-[17px] font-lexend text-muted-foreground max-w-xl mx-auto">
            Have questions about the platform or want to collaborate? Reach out directly.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Email Signature Style Card */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* Profile Image */}
              <div className="shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500/20 p-1 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
                  <img 
                    src="https://raw.githubusercontent.com/Potluri-Naga-Venkata-Sai/Email-Signature/main/assets/profile.jpeg" 
                    alt="Naga Venkata Sai Potluri" 
                    className="w-full h-full rounded-full object-cover object-center relative z-10"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-outfit font-bold text-foreground mb-1 tracking-tight">
                  Naga Venkata Sai Potluri
                </h3>
                <p className="text-blue-500 font-lexend font-bold text-sm md:text-base mb-3">
                  AI/ML & Robotics Engineer
                </p>
                <p className="text-muted-foreground font-lexend text-sm italic mb-6">
                  "Building intelligent software that solves real-world problems."
                </p>

                {/* Social Icons */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                  {[
                    { href: "https://github.com/Potluri-Naga-Venkata-Sai", icon: "github.svg", alt: "GitHub" },
                    { href: "https://x.com/Pnvs0954", icon: "x.svg", alt: "X" },
                    { href: "https://www.linkedin.com/in/naga-venkata-sai-potluri/", icon: "linkedin.svg", alt: "LinkedIn" },
                    { href: "https://nagavenkatasai.me/", icon: "globe.svg", alt: "Website" }
                  ].map((social, i) => (
                    <Link key={i} href={social.href} target="_blank" className="w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary hover:border-blue-500/50 hover:scale-105 transition-all duration-300">
                      <img src={`https://raw.githubusercontent.com/Potluri-Naga-Venkata-Sai/Email-Signature/main/assets/${social.icon}`} alt={social.alt} className="w-5 h-5 opacity-80 invert" />
                    </Link>
                  ))}
                </div>

                <div className="w-full h-px bg-border/50 mb-8"></div>

                {/* Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 font-lexend text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">Phone</span>
                    <a href="tel:+916302543156" className="text-foreground hover:text-blue-400 transition-colors font-medium">+91 6302543156</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">Email</span>
                    <a href="mailto:nagavenkatasaipotluri@gmail.com" className="text-foreground hover:text-blue-400 transition-colors font-medium truncate">nagavenkatasaipotluri@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">Education</span>
                    <span className="text-foreground font-medium">B-Tech CSE (AI & ML)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">Website</span>
                    <a href="https://nagavenkatasai.me/" target="_blank" className="text-foreground hover:text-blue-400 transition-colors font-medium">www.nagavenkatasai.me</a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
