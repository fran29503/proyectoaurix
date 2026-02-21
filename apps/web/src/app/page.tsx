import Link from "next/link";
import { ArrowRight, BarChart3, Users, Building2, Shield, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="text-lg font-bold text-violet-400">A</span>
          </div>
          <span className="text-xl font-bold">AURIX</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard?demo=true"
            className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-20 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
            <Zap className="h-3.5 w-3.5" />
            Real Estate CRM Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Real Estate
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Operating System
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Manage leads, properties, pipeline, and your team with the most
            intuitive CRM built for modern real estate professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard?demo=true"
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl font-medium shadow-lg shadow-violet-500/25 transition-all"
            >
              Try Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Lead Management",
              desc: "Track and nurture leads through a visual pipeline with drag-and-drop Kanban boards.",
            },
            {
              icon: Building2,
              title: "Property Catalog",
              desc: "Manage your property inventory with detailed listings, filters, and CSV export.",
            },
            {
              icon: BarChart3,
              title: "Reports & Analytics",
              desc: "Real-time dashboards with conversion funnels, agent performance, and channel insights.",
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              desc: "Role-based access control, audit logging, and row-level security for multi-tenant data.",
            },
            {
              icon: Globe,
              title: "Multi-Language",
              desc: "Full support for English, Spanish, and Arabic with RTL layout.",
            },
            {
              icon: Zap,
              title: "Built for Speed",
              desc: "Next.js 15 with React 19 for lightning-fast page loads and interactions.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to transform your real estate business?
        </h2>
        <p className="text-white/50 mb-8 text-lg">
          Start with our interactive demo — no signup required.
        </p>
        <Link
          href="/dashboard?demo=true"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl font-medium shadow-lg shadow-violet-500/25 transition-all"
        >
          Launch Demo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-400">A</span>
            </div>
            <span className="font-semibold">AURIX</span>
            <span className="text-white/30 text-sm">CRM</span>
          </div>
          <p className="text-white/30 text-sm">
            Powered by AURIX Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
