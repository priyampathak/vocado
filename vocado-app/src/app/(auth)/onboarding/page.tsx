"use client";

import { useState } from "react";
import { createWorkspace, joinWorkspace } from "@/app/actions/workspace";
import { Loader2, Plus, ArrowRight, Building2 } from "lucide-react";

export default function OnboardingPage() {
    const [activeTab, setActiveTab] = useState<"create" | "join">("create");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAction(formData: FormData) {
        setLoading(true);
        setError(null);
        let result;

        if (activeTab === "create") {
            result = await createWorkspace(formData);
        } else {
            result = await joinWorkspace(formData);
        }

        // If we land here, redirection didn't fire, meaning error happened
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans p-6 text-slate-800">

            {/* Brand */}
            <div className="flex flex-col items-center text-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-sm">
                    <Building2 className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Set up your workspace</h1>
                    <p className="text-[15px] text-slate-500 mt-1">Create a new hub or join your team.</p>
                </div>
            </div>

            {/* Main Card (Soft Bento Aesthetic) */}
            <div className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">

                {/* Toggle Segmented Pills */}
                <div className="flex items-center p-1 bg-slate-50 border border-slate-100/50 shadow-inner rounded-full mb-6 relative">
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 ${activeTab === "create" ? "left-1" : "left-[calc(50%+2px)]"}`}
                    />
                    <button
                        type="button"
                        onClick={() => setActiveTab("create")}
                        className={`flex-1 flex items-center justify-center py-2 text-[13px] font-semibold z-10 transition-colors ${activeTab === "create" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Create New
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("join")}
                        className={`flex-1 flex items-center justify-center py-2 text-[13px] font-semibold z-10 transition-colors ${activeTab === "join" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Join Existing
                    </button>
                </div>

                {/* Dynamic Form */}
                <form action={handleAction} className="flex flex-col gap-5">
                    {activeTab === "create" ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-slate-800 px-1">Workspace Name</label>
                            <input
                                type="text"
                                name="name"
                                autoComplete="off"
                                placeholder="e.g. Acme Corp"
                                disabled={loading}
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-medium disabled:opacity-50"
                                required
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-slate-800 px-1">Invite Code</label>
                            <input
                                type="text"
                                name="inviteCode"
                                autoComplete="off"
                                placeholder="XXXX-XXXX-XXXX"
                                disabled={loading}
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-medium font-mono uppercase tracking-wider disabled:opacity-50"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium border border-red-100/50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[14px] font-semibold shadow-[0_4px_14px_rgb(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                        ) : activeTab === "create" ? (
                            <>Start Building <Plus className="h-4 w-4" /></>
                        ) : (
                            <>Join Workspace <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                </form>
            </div>

        </div>
    );
}
