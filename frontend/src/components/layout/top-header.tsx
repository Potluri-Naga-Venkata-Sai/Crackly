"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useProgram, ProgramType } from "@/context/ProgramContext";

const PROGRAMS: ProgramType[] = [
  "Full Stack Development",
  "Data Science",
  "AI and Machine Learning",
  "Generative AI",
  "Competitive Coding"
];

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const { program, setProgram } = useProgram();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const displayName = session?.user?.user_metadata?.display_name;
        if (displayName) {
          setUserName(displayName);
        } else if (session.user.email) {
          const name = session.user.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const displayName = session?.user?.user_metadata?.display_name;
        if (displayName) {
          setUserName(displayName);
        } else if (session.user.email) {
          const name = session.user.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      } else {
        setUserName("User");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hide sidebar and topheader on login and landing page
  if (pathname === "/login" || pathname === "/") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-[72px] flex items-center justify-end px-6 border-b border-border/50 bg-background sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-6">
        <select 
          value={program}
          onChange={(e) => setProgram(e.target.value as ProgramType)}
          className="bg-transparent border border-border/50 text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer hover:bg-white/5 transition-colors"
        >
          {PROGRAMS.map(p => (
            <option key={p} value={p} className="bg-background text-foreground">{p}</option>
          ))}
        </select>

        <div className="h-4 w-px bg-border/50" />

        <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
          <User className="h-4 w-4" />
          <span className="text-sm font-semibold">{userName}</span>
        </Link>
        
        <div className="h-4 w-px bg-border/50" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="h-4 w-px bg-border/50" />
        
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 h-9 text-sm px-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
}
