import { create } from "zustand";

interface UIState {
    // Topbar 1: Module Selector (Static pills)
    activeModule: "Doc" | "Board" | "Table" | "Input" | null;
    setActiveModule: (module: "Doc" | "Board" | "Table" | "Input" | null) => void;

    // Topbar 2: View Selector (Contextual based on Module)
    activeView: string | null;
    setActiveView: (view: string | null) => void;

    // Active Context
    activePlotId: string | null;
    setActivePlotId: (plotId: string | null) => void;

    // Stream (Right Sidebar chat)
    isStreamOpen: boolean;
    toggleStream: () => void;
    setStreamOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeModule: "Board",
    setActiveModule: (module) => set({ activeModule: module }),

    activeView: "Kanban",
    setActiveView: (view) => set({ activeView: view }),

    activePlotId: null,
    setActivePlotId: (id) => set({ activePlotId: id }),

    isStreamOpen: false,
    toggleStream: () => set((state) => ({ isStreamOpen: !state.isStreamOpen })),
    setStreamOpen: (isOpen) => set({ isStreamOpen: isOpen }),
}));
