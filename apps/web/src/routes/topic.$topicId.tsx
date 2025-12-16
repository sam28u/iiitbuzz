import { ArrowLeft, MessageSquare, Eye, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/ui/header"; // Assuming you have these components
import Footer from "@/components/ui/footer"; // Assuming you have these components
import Loader from "@/components/loader";     // Assuming you have a Loader

// =================================================================
// 1. DATA INTERFACES (Based on expected backend response)
// =================================================================

interface TopicDetail {
    id: string;
    topicName: string;
    topicDescription: string;
    // The backend should return these. We'll use a local helper for icon/color for now.
}

interface Thread {
    id: string;
    threadTitle: string;
    createdAt: string;
    // Made optional to prevent crash if backend doesn't return the object
    author?: { 
        username: string;
    };
    replyCount?: number; // Made optional
    viewCount?: number; // Made optional
    likes?: number;     // Made optional
    isPinned?: boolean; // Made optional
    // Note: If your backend sends 'pinnedAt', you'd add: pinnedAt?: string;
}

// =================================================================
// 2. CONFIGURATION & HELPERS
// =================================================================

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Helper for visual data not stored in the database
const getTopicPresentation = (id: string) => {
    // Simple logic to assign an icon and color based on the ID for styling
    const colors = ["bg-yellow-400", "bg-green-400", "bg-red-400", "bg-blue-400"];
    const icons = ["💬", "🛠️", "❓", "📢"];
    const hash = id.length % 4;
    return {
        colorClass: colors[hash % colors.length],
        icon: icons[hash % icons.length],
    };
};

// =================================================================
// 3. MAIN COMPONENT
// =================================================================

export default function ThreadsPage() {
    const { topicId } = useParams<{ topicId: string }>(); // Get the ID from the URL
    
    const [topic, setTopic] = useState<TopicDetail | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const threadsPerPage = 10; // Matches your limit in threads.ts

    // NOTE: This state would be used to control the query to the backend (e.g., &sort=latest)
    // const [sortBy, setSortBy] = useState("latest"); 

    useEffect(() => {
        if (!topicId) {
            setError("Topic ID is missing.");
            setLoading(false);
            return;
        }

        const fetchTopicAndThreads = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Fetch Topic Details (Needed for the header)
                // NOTE: This GET /topics/:id route must be added to your topics.ts file.
                const topicResponse = await fetch(`${backendUrl}/topics/${topicId}`, { credentials: "include" });
                const topicData = await topicResponse.json();

                if (!topicResponse.ok || !topicData.success) {
                    throw new Error(topicData.error || "Topic not found.");
                }
                setTopic(topicData.topic); 

                // 2. Fetch Threads List (Uses existing route)
                const threadsResponse = await fetch(
                    `${backendUrl}/topics/${topicId}/threads?page=${currentPage}&limit=${threadsPerPage}`,
                    { credentials: "include" }
                );

                const threadsData = await threadsResponse.json();

                if (!threadsResponse.ok || !threadsData.success) {
                    throw new Error(threadsData.error || "Failed to load threads.");
                }
                
                // Assuming the backend response structure is updated to include counts and author details
                setThreads(threadsData.threads as Thread[]);
                
                // Set pagination info
                setTotalPages(Math.ceil(threadsData.pagination.count / threadsPerPage));
                
            } catch (err) {
                console.error("Error fetching threads:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchTopicAndThreads();
    }, [topicId, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Loader />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Error Loading Topic</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || "The topic or threads could not be found."}
                    </p>
                    <Link to="/home" className="text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4 inline mr-2" />
                        Return to Forum Home
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }
    
    // Get presentation data for the header
    const presentation = getTopicPresentation(topic.id);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            
            {/* Header Section */}
            <header className="border-b-4 border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
                    <Link
                        to="/home" // Changed from href="/" to to="/home"
                        className="mb-3 sm:mb-4 inline-flex items-center gap-2 font-bold text-sm sm:text-base text-primary hover:underline"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        Back to Home
                    </Link>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className={`flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center border-4 border-border ${presentation.colorClass} text-2xl sm:text-4xl`}
                            >
                                {presentation.icon}
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-2xl sm:text-4xl text-foreground leading-tight">{topic.topicName}</h1>
                                <p className="mt-1 text-sm sm:text-base text-muted-foreground line-clamp-1">
                                    {topic.topicDescription}
                                </p>
                            </div>
                        </div>
                        <Link
                            // 1. Change path to the global new thread component
                            to={`/new-thread`} 
                            // 2. Pass the topic details via state
                            state={{ initialTopicId: topicId, initialTopicName: topic.topicName }}
                            className="border-3 border-border bg-primary px-4 sm:px-6 py-2 font-bold text-sm sm:text-base text-primary-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] self-start"
                        >
                            New Thread
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 flex-1">
                {/* Sorting Options */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {/* These buttons would update the sorting state and trigger a re-fetch */}
                        <button className="border-3 border-border bg-foreground px-3 sm:px-4 py-2 font-bold text-sm text-background shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                            Latest
                        </button>
                        <button className="border-3 border-border bg-card px-3 sm:px-4 py-2 font-bold text-sm text-card-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:opacity-80">
                            Top
                        </button>
                        <button className="border-3 border-border bg-card px-3 sm:px-4 py-2 font-bold text-sm text-card-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:opacity-80">
                            Trending
                        </button>
                    </div>
                    <span className="font-bold text-muted-foreground text-xs sm:text-sm">{threads.length} Threads</span>
                </div>

                {/* Threads List */}
                <div className="space-y-3 sm:space-y-4">
                    {threads.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-4 border-border border-dashed p-8">
                            <p className="text-lg">No threads found in this topic. Be the first to start one!</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <Link key={thread.id} to={`/thread/${thread.id}`} className="block">
                                <div
                                    className={`border-4 border-border bg-card text-card-foreground p-4 sm:p-5 shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px]`}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                        {/* Author Avatar (Using first two letters of username, with fallback) */}
                                        <div className="flex-shrink-0 self-start">
                                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-3 border-border bg-primary font-bold text-sm sm:text-base text-primary-foreground">
                                                {/* Defensive coding: use optional chaining and provide a fallback string */}
                                                {(thread.author?.username || '??').substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Thread Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                              {/* Only display PINNED if the optional isPinned property is true */}
                                              {thread.isPinned && ( 
                                                <span className="rounded border-2 border-border bg-accent px-2 py-0.5 font-bold text-xs text-accent-foreground">
                                                  PINNED
                                                </span>
                                              )}
                                              <h3 className="flex-1 font-bold text-base sm:text-xl leading-tight">{thread.threadTitle}</h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <span className="font-bold">By {thread.author?.username || 'Unknown'}</span>
                                                <span className="text-muted-foreground">
                                                    Created {new Date(thread.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold sm:flex-shrink-0">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.replyCount}
                                            </span>
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.viewCount}
                                            </span>
                                            <span className="flex items-center gap-1 text-primary">
                                                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.likes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Pagination Controls (Placeholder - implement logic in the future) */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="neo-brutal-button px-4 py-2 bg-card text-foreground disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center font-bold text-sm text-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="neo-brutal-button px-4 py-2 bg-card text-foreground disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}