import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { FlaskConical, Lock, User } from "lucide-react";
import logo from "./../assets/logo.png"; 
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem("erp_token", data.token);
      localStorage.setItem("erp_user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-screen flex items-center justify-center bg-[#020408] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px)`
      }} />
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="industrial-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12  rounded-sm flex items-center justify-center">
                <img
  src={logo}
  alt="GH & Sons Logo"
  className="w-10 h-10 object-contain flex-shrink-0"
/>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wider uppercase" style={{ fontFamily: 'Barlow Condensed' }}>
                  GH & Sons Enterprises
                </h1>
                <p className="text-xs text-slate-500 tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono' }}>
                  Industrial Control System
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: 'Barlow Condensed' }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                <input
                  data-testid="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-10 pr-4 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: 'Barlow Condensed' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                <input
                  data-testid="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-10 pr-4 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <button
              data-testid="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-11 text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ fontFamily: 'Barlow Condensed' }}
            >
              {loading ? "Authenticating..." : "Access System"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600" style={{ fontFamily: 'JetBrains Mono' }}>
            admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
