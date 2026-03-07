import { create } from "zustand";

export interface ChatMember {
    userId: string;
    clerkId: string;
    name: string;
    avatarUrl: string | null;
    lastReadAt?: Date;
}

export interface ChatConversation {
    id: string;
    type: "DM" | "GROUP_DM" | "CHANNEL" | "PLOT_ACTIVITY";
    name: string;
    description?: string | null;
    visibility?: string | null;
    lastMessageAt: Date | null;
    lastMessageText: string | null;
    lastSenderId: string | null;
    lastReadAt: Date;
    members: ChatMember[];
    otherMembers: ChatMember[];
    createdAt: Date;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    content: string;
    mentions: string[];
    isSystem: boolean;
    sender: {
        id: string;
        name: string;
        avatarUrl: string | null;
        clerkId: string;
    };
    createdAt: Date | string;
    optimistic?: boolean;
}

export interface WorkspaceMemberChat {
    userId: string;
    clerkId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    isSelf: boolean;
}

interface ChatState {
    conversations: ChatConversation[];
    setConversations: (conversations: ChatConversation[]) => void;

    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;

    messages: Record<string, ChatMessage[]>;
    setMessages: (conversationId: string, messages: ChatMessage[]) => void;
    prependMessages: (conversationId: string, messages: ChatMessage[]) => void;
    addMessage: (conversationId: string, message: ChatMessage) => void;
    replaceOptimisticMessage: (conversationId: string, optimisticId: string, realMessage: ChatMessage) => void;
    removeMessage: (conversationId: string, messageId: string) => void;

    hasMore: Record<string, boolean>;
    setHasMore: (conversationId: string, has: boolean) => void;

    unreadCounts: Record<string, number>;
    setUnreadCounts: (counts: Record<string, number>) => void;
    incrementUnread: (conversationId: string) => void;
    clearUnread: (conversationId: string) => void;

    onlineUsers: Set<string>;
    setOnlineUsers: (users: Set<string>) => void;

    typingUsers: Record<string, string[]>;
    setTypingUser: (conversationId: string, clerkId: string, isTyping: boolean) => void;

    workspaceMembers: WorkspaceMemberChat[];
    setWorkspaceMembers: (members: WorkspaceMemberChat[]) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    updateConversationPreview: (conversationId: string, text: string, senderId: string, at: Date) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    setConversations: (conversations) => set({ conversations }),

    activeConversationId: null,
    setActiveConversationId: (id) => set({ activeConversationId: id }),

    messages: {},
    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [conversationId]: messages },
        })),
    prependMessages: (conversationId, older) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: [...older, ...(state.messages[conversationId] || [])],
            },
        })),
    addMessage: (conversationId, message) =>
        set((state) => {
            const existing = state.messages[conversationId] || [];
            if (existing.some((m) => m.id === message.id)) {
                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: existing.map((m) =>
                            m.id === message.id ? { ...message, optimistic: false } : m
                        ),
                    },
                };
            }
            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...existing, message],
                },
            };
        }),
    replaceOptimisticMessage: (conversationId, optimisticId, realMessage) =>
        set((state) => {
            const existing = state.messages[conversationId] || [];
            const idx = existing.findIndex((m) => m.id === optimisticId);
            if (idx === -1) {
                if (existing.some((m) => m.id === realMessage.id)) return state;
                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: [...existing, { ...realMessage, optimistic: false }],
                    },
                };
            }
            const updated = [...existing];
            updated[idx] = { ...realMessage, optimistic: false };
            return {
                messages: {
                    ...state.messages,
                    [conversationId]: updated,
                },
            };
        }),
    removeMessage: (conversationId, messageId) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).filter(
                    (m) => m.id !== messageId
                ),
            },
        })),

    hasMore: {},
    setHasMore: (conversationId, has) =>
        set((state) => ({
            hasMore: { ...state.hasMore, [conversationId]: has },
        })),

    unreadCounts: {},
    setUnreadCounts: (counts) => set({ unreadCounts: counts }),
    incrementUnread: (conversationId) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
            },
        })),
    clearUnread: (conversationId) =>
        set((state) => {
            const { [conversationId]: _, ...rest } = state.unreadCounts;
            return { unreadCounts: rest };
        }),

    onlineUsers: new Set(),
    setOnlineUsers: (users) => set({ onlineUsers: users }),

    typingUsers: {},
    setTypingUser: (conversationId, clerkId, isTyping) =>
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            const updated = isTyping
                ? Array.from(new Set([...current, clerkId]))
                : current.filter((id) => id !== clerkId);
            return {
                typingUsers: { ...state.typingUsers, [conversationId]: updated },
            };
        }),

    workspaceMembers: [],
    setWorkspaceMembers: (members) => set({ workspaceMembers: members }),

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    updateConversationPreview: (conversationId, text, senderId, at) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? { ...c, lastMessageText: text, lastSenderId: senderId, lastMessageAt: at }
                    : c
            ),
        })),
}));
