"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Code2, LineChart, ListChecks, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let authResponse;
      if (isSignUp) {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
      } else {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      const { data, error } = authResponse;

      if (error) {
        throw error;
      }

      if (isSignUp) {
        if (data?.user?.identities?.length === 0) {
          throw new Error("User already exists. Please sign in instead.");
        }
        if (data?.session === null) {
          setSuccessMsg("Success! Please check your email to verify your account.");
          setLoading(false);
          return;
        }
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] font-sans">
      {/* Left Side - Hero / Marketing */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-[#111111] to-[#1a1a2e]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-24">
            <div className="bg-red-600 p-1.5 rounded flex items-center justify-center">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-300 text-sm tracking-wide">Crackly</span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-2">
            Interview smarter. <br />
            <span className="text-blue-400">Perform better.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg max-w-md mt-6 mb-12 leading-relaxed">
            Practice coding, take timed tests, upload your resume for analysis, and track your skills — all in one place built for students and teams.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mb-16">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <Code2 className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Coding challenges</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-zinc-300">AI Mock Interviews</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <ListChecks className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-zinc-300">MCQ & aptitude</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <LineChart className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-zinc-300">Track your progress</span>
            </div>
          </div>

          {/* Decorative Code Snippet */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/10 shadow-2xl max-w-lg transform rotate-[-2deg]">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-sm font-mono text-zinc-300">
              <code>
                <span className="text-purple-400">function</span> <span className="text-blue-400">solve</span>(nums) {'{'}<br/>
                {'  '}<span className="text-purple-400">let</span> sum = <span className="text-orange-400">0</span>;<br/>
                {'  '}<span className="text-purple-400">for</span> (<span className="text-purple-400">const</span> n <span className="text-purple-400">of</span> nums) {'{'}<br/>
                {'    '}sum += n;<br/>
                {'  '}{'}'}<br/>
                {'  '}<span className="text-purple-400">return</span> sum;<br/>
                {'}'}<br/>
                <span className="text-zinc-500">{'// Ready for your next challenge 🚀'}</span>
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#09090b]">
        <div className="w-full max-w-sm bg-[#111111] border border-border/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isSignUp ? "Sign up to start tracking your progress" : "Sign in to continue to your dashboard"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                {successMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#18181b] border-border/50 h-11 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-red-600 focus-visible:ring-offset-0 focus-visible:border-red-600 transition-colors rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#18181b] border-border/50 h-11 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-red-600 focus-visible:ring-offset-0 focus-visible:border-red-600 transition-colors rounded-lg pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-between pt-1">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
                {!isSignUp && (
                  <Link href="#" className="text-xs text-red-500 hover:text-red-400 font-medium">
                    Forgot password?
                  </Link>
                )}
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11 rounded-lg font-medium text-[15px] mt-2 shadow-lg shadow-red-900/20" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>
        </div>
        
        <p className="text-zinc-600 text-xs mt-8">
          Secure login · Your data is encrypted in transit
        </p>
      </div>
    </div>
  );
}
