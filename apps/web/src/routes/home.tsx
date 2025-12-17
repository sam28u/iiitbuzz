import { Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import Footer from "@/components/ui/footer";

import { useEffect, useState } from "react";
import Header from "@/components/ui/header";
import Loader from "@/components/loader";


// Conceptual interface for Recent Threads
interface Topic {
    id: string;
    topicName: string;
    topicDescription: string;
    // These are from your backend's GET /topics (must be included in the response)
    threadCount?: number; 
    postCount?: number;
}

interface RecentThread {
    id: string;
    title: string;
    author: string;
    category: string;
    replies: number;
    views: number;
    lastActive: string;
}

interface ForumStats {
    totalTopics: number;
    totalThreads: number;
    totalPosts: number;
    totalMembers: number;
}


const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";




export default function HomePage() {

	const [topics, setTopics] = useState<Topic[]>([]);
    const [recentThreads, setRecentThreads] = useState<RecentThread[]>([]);
    const [stats, setStats] = useState<ForumStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to format time ago
    const formatTimeAgo = (isoString: string) => {
        const diff = new Date().getTime() - new Date(isoString).getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            const fetchTopics = async () => {
                const response = await fetch(`${backendUrl}/api/topics`, { credentials: "include" });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch topics.");
                }
                setTopics(data.data);
            };

            const fetchRecentThreads = async () => {
                const response = await fetch(`${backendUrl}/api/threads?page=1&limit=5&sort=latest`, { 
                    credentials: "include" 
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch recent threads.");
                }
                
                // Map the API response to RecentThread format
                const mappedThreads: RecentThread[] = data.threads.map((t: any) => ({
                    id: t.id,
                    title: t.title || t.threadTitle || "Untitled Thread",
                    author: t.authorName || "Anonymous",
                    category: t.categoryName || "General",
                    replies: Math.max(0, t.replies || 0), // Ensure non-negative
                    views: t.views || t.viewCount || 0,
                    lastActive: t.lastActive ? formatTimeAgo(t.lastActive) : (t.createdAt ? formatTimeAgo(t.createdAt) : "Just now"),
                }));
                
                setRecentThreads(mappedThreads);
            };

            const fetchStats = async () => {
                const response = await fetch(`${backendUrl}/api/stats`, { credentials: "include" });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch stats.");
                }
                setStats(data.stats);
            };

            try {
                
                await Promise.all([fetchTopics(), fetchRecentThreads(), fetchStats()]);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "An error occurred while loading the forum data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

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

    if (error) {
        return <div className="text-center p-12 text-lg text-red-600">{error}</div>;
    }

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 flex-1">
				
				<section className="mb-8 sm:mb-12">
                    <h2 className="mb-4 sm:mb-6 font-bold text-2xl sm:text-3xl text-foreground">
                        Topics
                    </h2>
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map((topic) => {
                           
                            return (
                                <Link
                                    key={topic.id}
                                    
                                    to={`/topic/${topic.id}`} 
                                    className="group block"
                                >
                                    <div className="neo-brutal-card-lg p-4 sm:p-6">
                                        <div className="mb-3 sm:mb-4 flex items-center gap-3">
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg sm:text-xl truncate">
                                                    {topic.topicName}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">
                                            {topic.topicDescription}
                                        </p>
                                        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">
                                                    {/* Uses data from the backend if available, otherwise 0 */}
                                                    {topic.threadCount ?? 0} Threads 
                                                </span>
                                            </span>
                                            <span className="text-muted-foreground whitespace-nowrap">
                                                 {/* Uses data from the backend if available, otherwise 0 */}
                                                {topic.postCount ?? 0} Posts
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    {topics.length === 0 && !loading && (
                        <div className="neo-brutal-empty">
                            <p className="text-lg">No topics have been created yet.</p>
                        </div>
                    )}
                </section>
                
				{/* Recent Threads Section */}
				<section>
					<div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="font-bold text-2xl sm:text-3xl text-foreground">
							Recent Threads
						</h2>
                        <Link to="/threads">
                            <button
                                className="neo-brutal-button-strong bg-card px-4 py-2 font-bold text-sm sm:text-base text-primary"
                            >
                                <span className="font-bold text-sm sm:text-base text-primary">View All &gt;</span>
                            </button>
                        </Link>
						{/* <Link
							to="/threads"
							className="font-bold text-sm sm:text-base text-primary hover:underline"
						>
							View All &gt;
						</Link> */}
					</div>
					<div className="space-y-3 sm:space-y-4">
						{recentThreads.length === 0 && !loading ? (
							<div className="text-center py-12 text-muted-foreground border-4 border-border border-dashed p-8">
								<p className="text-lg">No threads yet. Be the first to start a discussion!</p>
							</div>
						) : (
							recentThreads.map((thread) => (
								<Link
									key={thread.id}
									to={`/thread/${thread.id}`}
									className="block"
								>
									<div className="neo-brutal-card p-4 sm:p-5">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
											<div className="flex-1 min-w-0">
												<h3 className="mb-2 font-bold text-lg sm:text-xl leading-tight">
													{thread.title}
												</h3>
												<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
													<span className="font-bold">{thread.author}</span>
													<span className="rounded border-2 border-border bg-secondary text-secondary-foreground px-2 py-0.5 font-bold text-xs">
														{thread.category}
													</span>
													<span className="text-muted-foreground">
														{thread.lastActive}
													</span>
												</div>
											</div>
											<div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
												<span className="flex items-center gap-1">
													<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
													{thread.replies}
												</span>
												<span className="flex items-center gap-1 text-muted-foreground">
													<Eye className="h-3 w-3 sm:h-4 sm:w-4" />
													{thread.views}
												</span>
											</div>
										</div>
									</div>
								</Link>
							))
						)}
					</div>
				</section>

				{/* Stats Footer */}
				{stats && (
                    <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-3">
                        <div className="neo-brutal-card bg-primary text-primary-foreground p-4 sm:p-6">
                            <div className="font-bold text-3xl sm:text-4xl">{stats.totalTopics}</div>
                            <div className="mt-1 font-bold text-xs sm:text-sm">
                                TOTAL TOPICS
                            </div>
                        </div>
                        <div className="neo-brutal-card bg-secondary text-secondary-foreground p-4 sm:p-6">
                            <div className="font-bold text-3xl sm:text-4xl">{stats.totalPosts}</div>
                            <div className="mt-1 font-bold text-xs sm:text-sm">TOTAL POSTS</div>
                        </div>
                        <div className="neo-brutal-card bg-accent text-accent-foreground p-4 sm:p-6">
                            <div className="font-bold text-3xl sm:text-4xl">{stats.totalMembers}</div>
                            <div className="mt-1 font-bold text-xs sm:text-sm">MEMBERS</div>
                        </div>
                    </div>
                )}
			</main>
			<Footer />
		</div>
	);
}
