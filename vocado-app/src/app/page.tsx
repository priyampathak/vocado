import Link from "next/link";
import { ArrowRight, Aperture } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--color-beige)] flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 lg:px-12 py-5 w-full mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#ff6b00] text-white shadow-sm">
                        <Aperture className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-[var(--color-slate)]">
                        Projector
                    </span>
                </div>

                <nav className="flex items-center gap-3">
                    <Link href="/sign-in" className="px-5 py-2.5 text-[15px] font-semibold text-muted-foreground hover:text-[var(--color-slate)] transition-colors hidden sm:block">
                        Login
                    </Link>
                    <Link href="/sign-up" className="px-6 py-2.5 bg-[var(--color-slate)] text-white text-[15px] font-semibold rounded-full shadow-[0_4px_14px_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-[#1e2631]/90 transition-all">
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center text-center px-4 mt-16 md:mt-24 max-w-7xl mx-auto w-full relative">
                {/* Background Decor */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-pink)] rounded-full blur-[100px] opacity-40 mix-blend-multiply pointer-events-none" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-[var(--color-olive)] rounded-full blur-[100px] opacity-40 mix-blend-multiply pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-slate)]/5 border border-[var(--color-slate)]/10 text-[var(--color-slate)] text-[13px] font-bold tracking-tight mb-8">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b00] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff6b00]"></span>
                        </span>
                        Projector 2.0 is Live
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[84px] font-black text-[var(--color-slate)] tracking-tighter max-w-[1000px] leading-[1.05]">
                        The smartest way to organize your work.
                    </h1>

                    <p className="mt-8 text-lg md:text-[22px] text-muted-foreground max-w-[700px] leading-relaxed font-medium">
                        Spaces, goals, notes, and activity wrapped into one beautiful layout. Built for minimalists.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
                        <Link href="/sign-up" className="group px-8 py-4 bg-[#ff6b00] text-white text-[16px] font-extrabold rounded-full shadow-[0_8px_30px_rgba(255,107,0,0.3)] hover:bg-[#e56000] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                            Start Building Free
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="#demo" className="px-8 py-4 bg-white border-2 border-[var(--color-slate)] text-[var(--color-slate)] text-[16px] font-extrabold rounded-full shadow-sm hover:bg-[var(--color-slate)] hover:text-white transition-all duration-300">
                            View Live Demo
                        </Link>
                    </div>
                </div>

                {/* Soft Bento UI Mockup Display */}
                <div className="relative z-10 mt-28 w-full max-w-[1100px] mx-auto rounded-t-[2.5rem] bg-white border border-border shadow-[0_-20px_80px_rgb(0,0,0,0.06)] border-b-0 overflow-hidden flex flex-col">
                    <div className="h-16 border-b border-border bg-muted/30 flex items-center px-6 gap-2 w-full">
                        <div className="h-3.5 w-3.5 rounded-full bg-[#ff5f56]"></div>
                        <div className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e]"></div>
                        <div className="h-3.5 w-3.5 rounded-full bg-[#27c93f]"></div>
                    </div>
                    {/* Mockup Inner Content */}
                    <div className="pt-10 px-10 pb-0 flex gap-8 h-[450px]">
                        {/* Sidebar Mock */}
                        <div className="w-[240px] hidden md:flex flex-col gap-6">
                            <div className="h-12 border-2 border-border border-dashed rounded-[1rem] w-full flex items-center justify-center text-muted-foreground/50 font-bold text-sm">Navigation</div>
                            <div className="h-8 bg-muted rounded-lg w-3/4"></div>
                            <div className="h-8 bg-[var(--color-pink)]/40 rounded-lg w-full"></div>
                            <div className="h-8 bg-muted rounded-lg w-5/6"></div>
                        </div>
                        {/* Main Grid Mock */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex gap-6">
                                <div className="h-40 bg-[var(--color-olive)]/60 rounded-[1.5rem] flex-1"></div>
                                <div className="h-40 bg-[var(--color-pink)]/60 rounded-[1.5rem] flex-1"></div>
                            </div>
                            <div className="flex-1 bg-white border-2 border-border border-dashed rounded-t-[1.5rem] w-full flex items-center justify-center text-muted-foreground/50 font-bold text-lg">Main Canvas</div>
                        </div>
                        {/* Right Panel Mock */}
                        <div className="w-[280px] hidden lg:flex flex-col gap-6">
                            <div className="h-[200px] bg-white border border-border rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center gap-4">
                                <div className="h-20 w-20 rounded-full border-8 border-[var(--color-pink)] border-r-transparent animate-spin-slow"></div>
                            </div>
                            <div className="h-32 bg-[var(--color-slate)] rounded-[1.5rem] flex items-center justify-center text-white/50 font-bold">Stats View</div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-beige)]/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                </div>
            </main>
        </div>
    );
}
