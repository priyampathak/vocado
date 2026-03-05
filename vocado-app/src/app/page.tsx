import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

            {/* Soft Bento Header */}
            <header className="flex items-center justify-between px-6 lg:px-12 py-5 w-full mx-auto">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        <Box className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-[22px] text-slate-800 tracking-tight">Vocado OS</span>
                </div>

                <nav className="flex items-center gap-2 md:gap-4">
                    <Link href="/sign-in" className="px-5 py-2.5 text-[14px] font-semibold text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
                        Login
                    </Link>
                    <Link href="/sign-up" className="px-6 py-2.5 bg-slate-800 text-white text-[14px] font-semibold rounded-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-slate-700 transition-all">
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-40px]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[13px] font-bold tracking-tight mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                    </span>
                    Vocado 1.0 is Live
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight max-w-[900px] leading-[1.1]">
                    The unified operating system for your business.
                </h1>

                <p className="mt-8 text-lg md:text-[20px] text-slate-500 max-w-[700px] leading-relaxed font-medium">
                    Replace fragmented SaaS tools with a progressive workspace. Docs, Boards, and Streams powered by the revolutionary Plot engine.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/sign-up" className="group px-8 py-4 bg-brand text-white text-[15px] font-semibold rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:bg-brand/90 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2">
                        Start Building Free
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="#demo" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 text-[15px] font-semibold rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                        View Live Demo
                    </Link>
                </div>

                {/* Soft Bento UI Mockup Hint */}
                <div className="mt-20 w-full max-w-5xl h-[400px] rounded-t-3xl bg-white border border-slate-200 shadow-[0_-20px_60px_rgb(0,0,0,0.03)] border-b-0 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-12 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                        <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                        <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                        <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                    </div>
                    {/* Abstract Content */}
                    <div className="pt-20 px-12 flex gap-8 h-full opacity-60">
                        <div className="w-64 flex flex-col gap-4">
                            <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
                            <div className="h-8 bg-slate-100 rounded-lg w-3/4"></div>
                            <div className="h-8 bg-brand/10 rounded-lg w-5/6"></div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex gap-4">
                                <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl flex-1"></div>
                                <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl flex-1"></div>
                            </div>
                            <div className="h-64 bg-slate-50 border border-slate-100 rounded-2xl w-full"></div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
                </div>
            </main>
        </div>
    );
}
