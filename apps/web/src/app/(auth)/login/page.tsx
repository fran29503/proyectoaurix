"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  const enterDemoMode = () => {
    // Redirect to dashboard with demo mode enabled
    window.location.href = "/dashboard?demo=true";
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and performance" },
    { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption and protection" },
    { icon: Sparkles, title: "AI-Powered", desc: "Smart insights and automation" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-copper-500/20 blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-xl font-bold text-copper-400">M</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Meridian Harbor</h2>
              <p className="text-sm text-white/60">Realty</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Your Real Estate
                <br />
                <span className="text-gradient bg-gradient-to-r from-violet-400 via-purple-400 to-copper-400 bg-clip-text text-transparent">
                  Operating System
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-md">
                Manage leads, properties, and your team with the most intuitive
                CRM platform built for modern real estate professionals.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-sm text-white/40"
          >
            <p>Powered by AURIX Technology</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-white"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:hidden mb-8 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center mb-4 shadow-xl">
              <span className="text-2xl font-bold text-copper-500">M</span>
            </div>
            <h2 className="font-semibold text-xl text-slate-900">Meridian Harbor Realty</h2>
          </motion.div>

          {/* Form Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@meridianharbor.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 pr-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-slate-400">
                Demo Access
              </span>
            </div>
          </motion.div>

          {/* Demo Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={enterDemoMode}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 px-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-700 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-violet-500" />
              Try Demo Account
              <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-center text-sm text-slate-400"
          >
            By signing in, you agree to our{" "}
            <a href="#" className="text-violet-600 hover:text-violet-700 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-violet-600 hover:text-violet-700 transition-colors">
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
