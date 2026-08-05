import Link from "next/link";
import { Sparkles } from "lucide-react";

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-1.5 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="hidden font-bold sm:inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 text-lg">
          InterviewAI
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className="transition-colors hover:text-foreground/80 text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/interviews"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Mock Interviews
        </Link>
        <Link
          href="/practice"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Practice
        </Link>
        <Link
          href="/challenge"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          30-Day Challenge
        </Link>
      </nav>
    </div>
  );
}
