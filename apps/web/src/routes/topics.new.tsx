import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
// Assume you have custom components for Button, Input, and Textarea

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function CreateTopicPage() {
    const navigate = useNavigate();
    
    const [topicName, setTopicName] = useState("");
    const [topicDescription, setTopicDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic client-side validation
        if (topicName.length < 3) {
            setError("Topic name must be at least 3 characters.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/topics`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Request body matches your createTopicSchema in topics.ts
                body: JSON.stringify({
                    topicName,
                    topicDescription,
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // If backend returns a 400 or a specific error
                throw new Error(data.error || "Failed to create topic.");
            }

            // Success: Navigate to the newly created topic's threads page
            const newTopicId = data.topic.id; 
            navigate(`/topic/${newTopicId}`, { replace: true });

        } catch (err) {
            console.error("Error creating topic:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 flex-1">
                <Link
                    to="/home"
                    className="mb-4 sm:mb-6 inline-flex items-center gap-2 font-bold text-sm text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Forum Home
                </Link>

                <div className="border-4 border-border bg-card p-6 sm:p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
                    <h1 className="mb-6 font-bold text-2xl sm:text-3xl text-foreground flex items-center gap-2">
                        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        Create a New Topic
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Topic Name Field */}
                        <div>
                            <label htmlFor="topicName" className="block text-sm font-bold mb-2 text-foreground">
                                Topic Name
                            </label>
                            <input
                                id="topicName"
                                type="text"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full border-3 border-border bg-background p-3 text-foreground shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                                placeholder="e.g., General Discussion, Career Advice"
                                minLength={3}
                            />
                        </div>

                        {/* Topic Description Field */}
                        <div>
                            <label htmlFor="topicDescription" className="block text-sm font-bold mb-2 text-foreground">
                                Description
                            </label>
                            <textarea
                                id="topicDescription"
                                value={topicDescription}
                                onChange={(e) => setTopicDescription(e.target.value)}
                                required
                                disabled={loading}
                                rows={4}
                                className="w-full border-3 border-border bg-background p-3 text-foreground shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all resize-none"
                                placeholder="Provide a brief description of what this topic is about."
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="border-3 border-red-500 bg-red-100 text-red-700 p-3 font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full neo-brutal-button bg-foreground text-background border-foreground px-4 py-3 font-bold text-lg shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Topic"}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}