import { Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import Footer from "@/components/ui/footer";

import { useEffect, useState } from "react";
import Header from "@/components/ui/header";
import { topics, homeRecentThreads } from "@/data/mock";
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

interface ForumStats {
    totalTopics: number;
    totalPosts: number;
    totalMembers: number;
}

// =================================================================
// 2. CONFIGURATION & HELPERS
// =================================================================

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Helper for visual data not stored in the database
const getTopicPresentation = (id: string) => {
    // Simple logic to assign an icon and color based on the ID for styling
    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500"];
    const icons = ["DEV", "ASK", "H", "GEN"];
    const hash = id.length % 4;
    return {
        colorClass: colors[hash % colors.length],
        icon: icons[hash % icons.length],
    };
};

export default function HomePage() {

	const [topics, setTopics] = useState<Topic[]>([]);
    const [stats, setStats] = useState<ForumStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            const fetchTopics = async () => {
                const response = await fetch(`${backendUrl}/topics`, { credentials: "include" });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch topics.");
                }
                setTopics(data.data);
            };

            const fetchStats = async () => {
                // Keep this hardcoded until you create the GET /stats backend endpoint
                setStats({
                    totalTopics: 616,
                    totalPosts: 9700,
                    totalMembers: 1200
                });
            };

            try {
                // Execute fetches concurrently
                await Promise.all([fetchTopics(), fetchStats()]);
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
				{/* topics Section */}
				<section className="mb-8 sm:mb-12">
                    <h2 className="mb-4 sm:mb-6 font-bold text-2xl sm:text-3xl text-foreground">
                        Topics
                    </h2>
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map((topic) => {
                            const presentation = getTopicPresentation(topic.id);
                            return (
                                <Link
                                    key={topic.id}
                                    // *** ROUTE: Links to the threads list for this topic ***
                                    to={`/topic/${topic.id}`} 
                                    className="group block"
                                >
                                    <div className="border-4 border-border bg-card text-card-foreground p-4 sm:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[4px] hover:translate-y-[4px]">
                                        <div className="mb-3 sm:mb-4 flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-3 border-border ${presentation.colorClass} text-xl sm:text-2xl flex-shrink-0`}
                                            >
                                                {presentation.icon}
                                            </div>
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
                        <div className="text-center py-12 text-muted-foreground border-4 border-border border-dashed p-8">
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
						<Link
							to="/all-threads"
							className="font-bold text-sm sm:text-base text-primary hover:underline"
						>
							View All &gt;
						</Link>
					</div>
					<div className="space-y-3 sm:space-y-4">
						{homeRecentThreads.map((thread) => (
							<Link
								key={thread.id}
								to={`/thread/${thread.id}`}
								className="block"
							>
								<div className="border-4 border-border bg-card text-card-foreground p-4 sm:p-5 shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px]">
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
						))}
					</div>
				</section>

				{/* Stats Footer */}
				{stats && (
                    <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-3">
                        <div className="border-4 border-border bg-primary text-primary-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <div className="font-bold text-3xl sm:text-4xl">{stats.totalTopics}</div>
                            <div className="mt-1 font-bold text-xs sm:text-sm">
                                TOTAL TOPICS
                            </div>
                        </div>
                        <div className="border-4 border-border bg-secondary text-secondary-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
                            <div className="font-bold text-3xl sm:text-4xl">{stats.totalPosts}</div>
                            <div className="mt-1 font-bold text-xs sm:text-sm">TOTAL POSTS</div>
                        </div>
                        <div className="border-4 border-border bg-accent text-accent-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
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
