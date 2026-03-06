import { Aperture } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[var(--color-beige)] p-4 md:p-6 lg:p-8">
            <div className="flex w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-border">
                {/* Left Side: Branding / Abstract Art (Hidden on mobile) */}
                <div className="relative hidden w-[45%] flex-col justify-between bg-[var(--color-slate)] p-12 text-white lg:flex">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00] shadow-sm">
                            <Aperture className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Projector</span>
                    </div>

                    <div className="relative z-10 mt-auto max-w-sm">
                        <h1 className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white">
                            The smartest way to organize your work.
                        </h1>
                        <p className="text-[15px] leading-relaxed text-[#c0c954]">
                            Spaces, goals, notes, and activity wrapped into one beautiful layout. Built for minimalists.
                        </p>
                    </div>

                    {/* Abstract Shapes Decor */}
                    <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-[3rem] bg-[var(--color-pink)] opacity-20 blur-3xl transform rotate-12" />
                    <div className="absolute top-20 right-20 h-32 w-32 rounded-full bg-[var(--color-olive)] opacity-20 blur-2xl" />
                </div>

                {/* Right Side: Auth Form */}
                <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
                    <div className="w-full max-w-[400px]">
                        {/* Mobile Header */}
                        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00] shadow-sm">
                                <Aperture className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-[var(--color-slate)]">Projector</span>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
