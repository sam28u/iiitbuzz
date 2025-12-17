// src/routes/thread/$threadId.tsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp, ThumbsDown, Flag, Share2, Bookmark } from "lucide-react";

// =================================================================
// TYPES & UTILITIES
// =================================================================

interface ThreadDetail {
    id: string;
    title: string;
    topicId: string;
    topicName: string; 
    topicColor?: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    viewCount: number;
    isPinned: boolean;
}

interface PostDetail {
    postId: string;
    content: string;
    createdAt: string;
    // Author Data (received from backend JOIN)
    authorId: string;
    authorName: string;
    authorAvatar: string; // Derived/mocked on frontend since backend doesn't send URL
    postCount: number; // Mocked for now, as it requires a separate backend calculation
    likes: number; 
}

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// --- MOCK UTILITIES ---
const formatTimeAgo = (isoString: string) => {
    // Basic time ago function (replace with real utility)
    const diff = new Date().getTime() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes ago`;
    return new Date(isoString).toLocaleDateString();
};

const getCategoryColor = (topicId: string) => {
    // Placeholder logic for styling
    const colors = ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-red-400", "bg-purple-400"];
    return colors[topicId.length % colors.length];
};
// ----------------------

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function ThreadPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [posts, setPosts] = useState<PostDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the Reply Box
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    
    // For Markdown: ref to the textarea
    const replyContentRef = useRef<HTMLTextAreaElement>(null);

    // Function to fetch posts (for initial load and after submission)
    const fetchPosts = async (threadId: string) => {
        try {
            const postsRes = await fetch(`${backendUrl}/api/threads/${threadId}/posts?limit=100`, { credentials: "include" });

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                
                const fetchedPosts: PostDetail[] = postsData.posts.map((p: any) => ({
                    postId: p.postId,
                    content: p.content,
                    createdAt: p.createdAt,
                    authorId: p.authorId,
                    authorName: p.authorName,
                    authorAvatar: p.authorName.substring(0, 2).toUpperCase(), // Derive initials
                    postCount: 0, // Mock, needs backend calculation
                    likes: p.likes || 0,
                }));
                setPosts(fetchedPosts);
                return fetchedPosts;
            } else if (postsRes.status !== 404) {
                throw new Error("Failed to fetch replies.");
            }
            return [];
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Could not load replies.");
            return [];
        }
    }


    
    useEffect(() => {
        if (!threadId) {
            setError("Thread ID is missing.");
            setLoading(false);
            return;
        }

        const fetchThreadData = async () => {
            setLoading(true);
            try {
                const threadRes = await fetch(`${backendUrl}/api/threads/${threadId}`, { credentials: "include" });
        
                if (!threadRes.ok) throw new Error("Thread not found.");
                const threadData = await threadRes.json();
                
                // Use the actual data from the backend response
                const fetchedThread: ThreadDetail = {
                    id: threadId!,
                    title: threadData.thread.threadTitle,
                    topicId: threadData.thread.topicId,
                    topicName: threadData.thread.topicName || "General Discussion", // Use backend field
                    topicColor: getCategoryColor(threadData.thread.topicId), // Keep your color utility
                    authorId: threadData.thread.createdBy,
                    authorName: threadData.thread.authorName || "User-" + threadData.thread.createdBy.substring(0, 4),
                    createdAt: threadData.thread.createdAt,
                    viewCount: threadData.thread.viewCount || 0,
                    isPinned: threadData.thread.isPinned || false,
                };
                
                setThread(fetchedThread);
                await fetchPosts(threadId!);
        
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred while loading thread.");
            } finally {
                setLoading(false);
            }
        };

        fetchThreadData();
    }, [threadId]);

    // 2. Reply Submission Handler
    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReply(true);
        setError(null); 
        
        if (!replyContent.trim()) {
            setError("Reply content cannot be empty.");
            setSubmittingReply(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/posts`, { // NOTE: Changed from /posts/new to /posts based on your Drizzle route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify({
                    threadId: threadId,
                    content: replyContent,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to post reply.");
            }
            
            // Success: Clear the reply box and re-fetch posts to include the new one
            setReplyContent("");
            await fetchPosts(threadId!); // Re-fetch all posts
            
        } catch (err) {
            console.error("Error posting reply:", err);
            setError(err instanceof Error ? err.message : "An error occurred while posting your reply.");
        } finally {
            setSubmittingReply(false);
        }
    };
    
    // 3. Markdown Formatting Utility (Bold and Italic)
    const applyFormatting = (syntax: string) => {
        const textarea = replyContentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        const prefix = value.substring(0, start);
        const selectedText = value.substring(start, end);
        const suffix = value.substring(end);

        const newContent = `${prefix}${syntax}${selectedText}${syntax}${suffix}`;

        setReplyContent(newContent); 

        // Set cursor position after the inserted syntax for better UX
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + syntax.length;
        }, 0);
    };


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading Thread...</p></div>;
    }

    if (error || !thread) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-red-500 font-bold">Error: {error || "Thread not found."}</p></div>;
    }
    
    const opId = thread.authorId;
    
    // --- Render ---
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="neo-brutal-header">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
                    <Link
                        to="/home"
                        className="mb-3 sm:mb-4 inline-flex items-center gap-2 font-bold text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        Back to Forum
                    </Link>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                {thread.isPinned && (
                                    <span className="rounded border-2 border-border bg-accent px-2 py-0.5 font-bold text-xs text-accent-foreground">
                                        PINNED
                                    </span>
                                )}
                                <Link to={`/topic/${thread.topicId}`}>
                                    <span
                                        className={`rounded border-2 border-border ${thread.topicColor} px-2 py-0.5 font-bold text-xs hover:opacity-80`}
                                    >
                                        {thread.topicName}
                                    </span>
                                </Link>
                            </div>
                            <h1 className="mb-2 font-bold text-2xl sm:text-3xl leading-tight text-foreground">{thread.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                <span>
                                    Started by <span className="font-bold">{thread.authorName}</span>
                                </span>
                                <span>{formatTimeAgo(thread.createdAt)}</span>
                                <span>{thread.viewCount} views</span>
                            </div>
                        </div>
                        <div className="flex gap-2 self-start">
                            <button className="neo-brutal-button bg-card p-2">
                                <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button className="neo-brutal-button bg-card p-2">
                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
                {/* Posts */}
                <div className="space-y-4 sm:space-y-6">
                    {posts.map((post, index) => {
                        const isOP = post.authorId === opId;
                        const authorAvatarInitials = post.authorAvatar;
                        const authorPostCount = post.postCount || 1; // Default to 1 if not calculated

                        return (
                            <div key={post.postId} className="neo-brutal-card">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                                    {/* Author Sidebar */}
                                    <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 sm:w-40 sm:flex-shrink-0">
                                        <div className="neo-brutal-avatar h-12 w-12 sm:h-20 sm:w-20 text-lg sm:text-2xl flex-shrink-0 border-4">
                                            {authorAvatarInitials}
                                        </div>
                                        <div className="flex-1 sm:flex-initial sm:w-full">
                                            <div className="font-bold text-base sm:text-lg text-foreground">{post.authorName}</div>
                                            
                                            {/* Removed MOD tag */}
                                            {isOP && (
                                                <div className="mt-1 rounded border-2 border-border bg-accent px-2 py-0.5 text-center font-bold text-xs text-accent-foreground inline-block sm:block">
                                                    OP
                                                </div>
                                            )}
                                            <div className="hidden sm:block mt-2 text-muted-foreground text-sm">
                                                {/* Role is gone, use a generic status */}
                                                <div>Member</div> 
                                                <div className="mt-1">{authorPostCount} posts</div>
                                                {/* Join date is gone */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-3 sm:mb-4 flex items-center justify-between border-b-2 border-border pb-2 sm:pb-3">
                                            <span className="font-bold text-muted-foreground text-xs sm:text-sm">#{index + 1}</span>
                                            <span className="text-muted-foreground text-xs sm:text-sm">{formatTimeAgo(post.createdAt)}</span>
                                        </div>
                                        {/* NOTE: If you implemented Markdown, use a Markdown parser here */}
                                        <div className="mb-3 sm:mb-4 text-sm sm:text-base text-card-foreground leading-relaxed">
                                            {post.content}
                                        </div>

                                        {/* Post Actions (Likes/Dislikes/Reply) */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                            <button className="neo-brutal-button border-2 bg-accent px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm text-accent-foreground">
                                                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {post.likes}
                                            </button>
                                            <button className="neo-brutal-button border-2 bg-card px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm">
                                                <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </button>
                                            <button className="neo-brutal-button border-2 bg-card px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm">
                                                Reply
                                            </button>
                                            <button className="neo-brutal-button ml-auto border-2 bg-card px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm">
                                                <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">Report</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reply Box */}
                <form onSubmit={handlePostReply} className="mt-6 sm:mt-8 neo-brutal-card p-4 sm:p-6">
                    <h3 className="mb-3 sm:mb-4 font-bold text-lg sm:text-xl text-foreground">Post a Reply</h3>
                    
                    <textarea
                        placeholder="Share your thoughts... (Use **text** for bold, *text* for italic)"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        ref={replyContentRef}
                        disabled={submittingReply}
                        className="neo-brutal-input mb-3 sm:mb-4 h-32 w-full resize-none bg-background text-foreground p-3 sm:p-4 text-sm sm:text-base font-medium"
                    />
                    
                    {error && (
                        <p className="mb-3 font-bold text-destructive text-sm">{error}</p>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button 
                                type="button" 
                                onClick={() => applyFormatting('**')}
                                disabled={submittingReply}
                                className="neo-brutal-button bg-card px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm disabled:opacity-50">
                                Bold
                            </button>
                            <button 
                                type="button" 
                                onClick={() => applyFormatting('*')}
                                disabled={submittingReply}
                                className="neo-brutal-button bg-card px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm disabled:opacity-50">
                                Italic
                            </button>
                            <button 
                                type="button"
                                disabled={submittingReply}
                                className="neo-brutal-button bg-card px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm disabled:opacity-50">
                                Link
                            </button>
                        </div>
                        <button 
                            type="submit"
                            disabled={submittingReply || !replyContent.trim()}
                            className="neo-brutal-button-strong bg-primary px-4 sm:px-6 py-2 font-bold text-sm sm:text-base text-primary-foreground disabled:opacity-50">
                            {submittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}