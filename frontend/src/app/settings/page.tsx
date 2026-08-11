"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { User, Lock, Upload, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Profile Form
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  // Security Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        const displayName = session.user.user_metadata?.display_name;
        if (displayName) {
          setUsername(displayName);
        } else if (session.user.email) {
          const name = session.user.email.split("@")[0];
          setUsername(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: username }
      });
      if (error) throw error;
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 font-sans max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab("profile"); setMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Profile Details
            </button>
            <button
              onClick={() => { setActiveTab("security"); setMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "security" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Lock className="h-4 w-4" />
              Security & Password
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              message.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            }`}>
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div className="text-sm font-medium leading-relaxed">{message.text}</div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground">Profile Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your personal information and how others see you.</p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="h-24 w-24 rounded-full bg-muted border-2 border-border flex items-center justify-center text-3xl font-bold text-muted-foreground overflow-hidden">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <Button variant="outline" className="mb-2 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed outline-none text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="e.g. Potluri"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-foreground flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground">Security & Password</h2>
                <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-foreground flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
