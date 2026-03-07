import { getConversations, getUnreadCounts, getWorkspaceMembersForChat } from "@/app/actions/chat";
import { ChatClient } from "./chat-client";

interface ChatPageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { workspaceId } = await params;

    const [conversations, unreadCounts, members] = await Promise.all([
        getConversations(workspaceId),
        getUnreadCounts(workspaceId),
        getWorkspaceMembersForChat(workspaceId),
    ]);

    return (
        <ChatClient
            workspaceId={workspaceId}
            initialConversations={conversations}
            initialUnreadCounts={unreadCounts}
            initialMembers={members}
        />
    );
}
