// src/routes/AllThreadsPage.tsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, Eye, ThumbsUp } from "lucide-react";

// =================================================================
// TYPES & MOCKS
// =================================================================

interface ThreadListItem {
    id: string;
    title: string;
    categoryName: string;
    categoryColor: string;
    authorName: string;
    lastActive: string;
    replies: number;
    views: number;
    likes: number;
    isPinned: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    count: number;
}

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// --- Utility Functions ---
const formatTimeAgo = (isoString: string) => {
    // Basic time ago function (replace with real utility)
    const diff = new Date().getTime() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes ago`;
    return new Date(isoString).toLocaleDateString();
};
const getAuthorAvatar = (name: string) => name.substring(0, 2).toUpperCase();
const PAGE_LIMIT = 20;

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function AllThreadsPage() {
    const [threads, setThreads] = useState<ThreadListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for filtering/pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<"latest" | "top" | "trending" | "views">("latest");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_LIMIT, count: 0 });


    const fetchThreads = async () => {
        setLoading(true);
        setError(null);
        
        // Build URLSearchParams
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', PAGE_LIMIT.toString());
        params.append('sort', sort);
        if (searchQuery) {
            params.append('search', searchQuery);
        }

        try {
            const response = await fetch(`${backendUrl}/api/threads?${params.toString()}`, {
                credentials: "include"
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch threads: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || "Failed to fetch threads.");
            }
            
            // Map the fetched data to ThreadListItem interface
            const fetchedThreads: ThreadListItem[] = data.threads.map((t: any) => ({
                id: t.id,
                title: t.threadTitle || t.title, // Handle potential naming difference
                categoryName: t.categoryName,
                categoryColor: t.categoryColor,
                authorName: t.authorName,
                lastActive: t.lastActive,
                replies: t.replies || 0,
                views: t.views || 0,
                likes: t.likes || 0,
                isPinned: t.isPinned,
            }));

            setThreads(fetchedThreads);
            setPagination(data.pagination);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while loading threads.");
            setThreads([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        // Debounce search input to avoid excessive calls (optional but recommended)
        const handler = setTimeout(() => {
            fetchThreads();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [currentPage, sort, searchQuery]); // Re-fetch on pagination, sort, or search change

    const totalPages = Math.ceil(pagination.count / pagination.limit);

    // --- Pagination Utility ---
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5; // Max page numbers to show
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)}
                    className={`border-3 border-border px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_0px_var(--shadow-color)] ${
                        i === currentPage 
                            ? 'bg-foreground text-background' 
                            : 'bg-card hover:opacity-80'
                    }`}
                    disabled={loading}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset page on search
    };

    const handleSortChange = (newSort: typeof sort) => {
        setSort(newSort);
        setCurrentPage(1); // Reset page on sort
    };
    
    const allThreadsLength = pagination.count;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="neo-brutal-header">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
                    <Link
                        to="/"
                        className="mb-3 sm:mb-4 inline-flex items-center gap-2 font-bold text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        Back to Home
                    </Link>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="font-bold text-2xl sm:text-4xl text-foreground">All Threads</h1>
                            <p className="mt-1 text-sm sm:text-base text-muted-foreground">Browse discussions from all categories</p>
                        </div>
                        <Link
                            to="/new-thread"
                            className="neo-brutal-button-strong bg-primary px-4 sm:px-6 py-2 font-bold text-sm sm:text-base text-primary-foreground self-start"
                        >
                            New Thread
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* Search & Filters */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-4">
                    <div className="relative w-full">
                        <Search className="absolute top-1/2 left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                        <input
                            type="text"
                            placeholder="Search threads..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            autoComplete="off"
                            className="neo-brutal-input w-full py-2 sm:py-3 pr-3 sm:pr-4 pl-10 sm:pl-12 text-sm sm:text-base font-bold relative z-0"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground">Sort by:</span>
                        {(["latest", "top", "views", "trending"] as const).map((s) => (
                            <button 
                                key={s}
                                onClick={() => handleSortChange(s)}
                                className={`neo-brutal-button px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm ${
                                    sort === s
                                        ? 'bg-foreground text-background'
                                        : 'bg-card hover:opacity-80'
                                }`}
                                disabled={loading}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-3 sm:mb-4 font-bold text-muted-foreground text-xs sm:text-sm">
                    {loading ? 'Loading...' : `${allThreadsLength} Total Threads`}
                </div>

                {/* Threads List */}
                {loading ? (
                    <div className="text-center py-10 font-bold text-lg">Loading threads...</div>
                ) : error ? (
                    <div className="text-center py-10 font-bold text-lg text-red-500">{error}</div>
                ) : threads.length === 0 ? (
                    <div className="text-center py-10 font-bold text-lg text-muted-foreground">No threads found. Try adjusting your search.</div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {threads.map((thread) => (
                            <Link key={thread.id} to={`/thread/${thread.id}`} className="block">
                                <div className="neo-brutal-card p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                        {/* Author Avatar */}
                                        <div className="flex-shrink-0 self-start">
                                            <div className="neo-brutal-avatar h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base">
                                                {getAuthorAvatar(thread.authorName)}
                                            </div>
                                        </div>

                                        {/* Thread Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                {thread.isPinned && (
                                                    <span className="rounded border-2 border-border bg-accent px-2 py-0.5 font-bold text-xs text-accent-foreground">
                                                        PINNED
                                                    </span>
                                                )}
                                                <span
                                                    className={`rounded border-2 border-border ${thread.categoryColor} px-2 py-0.5 font-bold text-xs`}
                                                >
                                                    {thread.categoryName}
                                                </span>
                                            </div>
                                            <h3 className="mb-2 font-bold text-base sm:text-xl leading-tight">{thread.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <span className="font-bold">{thread.authorName}</span>
                                                <span className="text-muted-foreground">Last active {formatTimeAgo(thread.lastActive)}</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold sm:flex-shrink-0">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.replies}
                                            </span>
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.views}
                                            </span>
                                            <span className="flex items-center gap-1 text-primary">
                                                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {thread.likes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}


                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="neo-brutal-button bg-card px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm hover:opacity-80 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        
                        {renderPaginationButtons()}
                        
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="neo-brutal-button bg-card px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm hover:opacity-80 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}