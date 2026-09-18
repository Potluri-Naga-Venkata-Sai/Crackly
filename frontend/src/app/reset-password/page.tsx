"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Code2, LineChart, ListChecks, Sparkles, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have an active session, as the reset link logs the user in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // We need the hash fragment to get the session if we are redirected from the email
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            // User is now logged in and can update their password
          }
        });
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }

      setSuccessMsg("Password updated successfully. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] font-sans">
      {/* Left Side - Hero / Marketing */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-[#111111] to-[#1a1a2e]">
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
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#09090b]">
        <div className="w-full max-w-sm bg-[#111111] border border-border/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Set new password
            </h2>
            <p className="text-zinc-400 text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
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
              <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300 text-xs font-semibold">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#18181b] border-border/50 h-11 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-red-600 focus-visible:ring-offset-0 focus-visible:border-red-600 transition-colors rounded-lg pr-10"
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11 rounded-lg font-medium text-[15px] mt-2 shadow-lg shadow-red-900/20" 
              disabled={loading || !!successMsg}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
