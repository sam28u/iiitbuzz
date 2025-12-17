import type React from "react";
import { useState, useEffect } from "react";
import { ArrowLeft, ImageIcon, Link2, Code } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Use react-router-dom components
// NOTE: Assuming Header, Footer, and Loader are not needed based on the new UI

// =================================================================
// TYPES & CONFIGURATION
// =================================================================

interface TopicOption {
    id: string;
    topicName: string;
    // We'll add a mock icon property for the UI, as your backend likely doesn't provide it
    icon?: string; 
}

interface NewThreadBody {
    topicId: string;
    threadTitle: string;
}

// Map database topic names to a relevant icon for the UI tiles
const topicIconMap: { [key: string]: string } = {
    'General Discussion': '💬',
    'Academics': '📚',
    'Campus Life': '🏫',
    'Tech & Gaming': '🎮',
    'Marketplace': '🛒',
    // Add more mappings as your topics grow
};


const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function NewThreadPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // State based on functional needs (ID)
    const [topics, setTopics] = useState<TopicOption[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState("");
    
    // State based on UI needs
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Topics & Handle Contextual Selection
    useEffect(() => {
        const fetchTopics = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${backendUrl}/api/topics`, { credentials: "include" });
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load topics.");
                }
                
                // FIX: Use data.data and map it to add an icon for the UI
                const fetchedTopics: TopicOption[] = (data.data as { id: string, topicName: string }[]).map(t => ({
                    ...t,
                    icon: topicIconMap[t.topicName] || '🏷️' // Fallback icon
                }));

                setTopics(fetchedTopics); 
                
                // Handle contextual routing state
                const initialState = location.state as { initialTopicId: string; initialTopicName: string } | undefined;

                if (initialState?.initialTopicId && fetchedTopics.some(t => t.id === initialState.initialTopicId)) {
                    // Contextual selection: Set the ID passed from the topic page
                    setSelectedTopicId(initialState.initialTopicId);
                } else {
                    // Default: Keep selectedTopicId as "" (forces user to click)
                    setSelectedTopicId("");
                }
            
            } catch (err) {
                console.error("Error fetching topics:", err);
                setError("Could not load topics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [location]); // Depend on location to update if user navigates back via state

    // 2. Handle Thread Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!selectedTopicId) {
            setError("Please select a category before submitting.");
            setSubmitting(false);
            return;
        }

        if (!title.trim() || title.length < 5) {
            setError("Thread title must be at least 5 characters.");
            setSubmitting(false);
            return;
        }

        if (!content.trim() || content.length < 10) {
            setError("Thread content must be at least 10 characters.");
            setSubmitting(false);
            return;
        }


        try {
            // NOTE: The initial post content (this.content) is NOT sent yet, 
            // as your backend POST /threads/new only accepts topicId and threadTitle.
            const threadData: NewThreadBody = {
                topicId: selectedTopicId,
                threadTitle: title,
            };

            const response = await fetch(`${backendUrl}/api/threads/new`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify(threadData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to create thread.");
            }
            
            // Success: Navigate back to the topic list where the new thread should appear
            const newThreadId = data.thread.id;
            navigate(`/topic/${selectedTopicId}`);
            
        } catch (err) {
            console.error("Error creating thread:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                {/* Replaced Loader component with a simple loading message for stability */}
                <p className="font-bold text-lg">Loading Topics...</p>
            </div>
        );
    }
    
    // --- Render ---
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b-4 border-border bg-card">
                <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
                    <Link
                        to="/"
                        className="mb-3 sm:mb-4 inline-flex items-center gap-2 font-bold text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        Back to Forum
                    </Link>
                    <h1 className="font-bold text-2xl sm:text-4xl text-foreground">Create New Thread</h1>
                    <p className="mt-1 text-sm sm:text-base text-muted-foreground">Start a new discussion in the forum</p>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
                <form onSubmit={handleSubmit}>
                    {/* Category Selection */}
                    <div className="mb-6">
                        <label className="mb-3 block font-bold text-base sm:text-lg text-foreground">Select Category</label>
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => setSelectedTopicId(topic.id)} // Selects the ID
                                    disabled={submitting}
                                    className={`border-4 border-border p-3 sm:p-4 text-left font-bold text-sm sm:text-base shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] ${
                                        selectedTopicId === topic.id
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-card text-card-foreground"
                                    } disabled:opacity-70`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl sm:text-2xl">{topic.icon}</span>
                                        <span className="leading-tight">{topic.topicName}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!selectedTopicId && (
                            <p className="mt-2 font-bold text-destructive text-xs sm:text-sm">Please select a category</p>
                        )}
                        {error && (
                            <p className="mt-2 font-bold text-destructive text-xs sm:text-sm">{error}</p>
                        )}
                    </div>

                    {/* Title Input */}
                    <div className="mb-6">
                        <label htmlFor="title" className="mb-3 block font-bold text-base sm:text-lg text-foreground">
                            Thread Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your thread about?"
                            className="w-full border-4 border-border bg-card text-foreground p-3 sm:p-4 text-sm sm:text-base font-bold shadow-[4px_4px_0px_0px_var(--shadow-color)] focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)]"
                            required
                            disabled={submitting}
                        />
                    </div>

                    {/* Content Editor */}
                    <div className="mb-6">
                        <label htmlFor="content" className="mb-3 block font-bold text-base sm:text-lg text-foreground">
                            Content
                        </label>
                        <div className="border-4 border-border bg-card shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                            {/* Toolbar - Placeholder for rich text */}
                            <div className="flex flex-wrap gap-2 border-b-4 border-border bg-secondary p-2 sm:p-3">
                                <button
                                    type="button"
                                    className="border-2 border-border bg-card p-2 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                    title="Bold"
                                >
                                    <span className="font-bold">B</span>
                                </button>
                                <button
                                    type="button"
                                    className="border-2 border-border bg-card p-2 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                    title="Italic"
                                >
                                    <span className="italic">I</span>
                                </button>
                                <button
                                    type="button"
                                    className="border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                    title="Add Link"
                                >
                                    <Link2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                    title="Add Image"
                                >
                                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
                                    title="Code Block"
                                >
                                    <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                            </div>

                            {/* Text Area */}
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your thoughts, ask questions, or start a discussion..."
                                className="h-48 sm:h-64 w-full resize-none bg-card text-foreground p-3 sm:p-4 text-sm sm:text-base leading-relaxed focus:outline-none"
                                required
                                disabled={submitting}
                            />
                        </div>
                        <p className="mt-2 text-muted-foreground text-xs sm:text-sm">
                            Be respectful and follow the community guidelines
                        </p>
                    </div>

                    {/* Options */}
                    <div className="mb-6 border-4 border-border bg-secondary p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                        <h3 className="mb-4 font-bold text-lg text-foreground">Thread Options</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-5 w-5 border-3 border-black accent-yellow-400" disabled={submitting} />
                                <span className="font-bold">Allow replies</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-5 w-5 border-3 border-black accent-yellow-400" disabled={submitting} />
                                <span className="font-bold">Subscribe to notifications</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-5 w-5 border-3 border-black accent-yellow-400" disabled={submitting} />
                                <span className="font-bold">Mark as question</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                        <button
                            type="submit"
                            disabled={submitting || !selectedTopicId || !title || !content}
                            className="w-full sm:w-auto border-4 border-black bg-yellow-400 px-8 py-3 font-bold text-sm sm:text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Thread'}
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            className="w-full sm:w-auto border-4 border-black bg-white px-8 py-3 font-bold text-sm sm:text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <Link
                            to="/"
                            className="w-full sm:w-auto text-center border-4 border-black bg-white px-8 py-3 font-bold text-sm sm:text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                {/* Guidelines */}
                <div className="mt-8 border-4 border-black bg-blue-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="mb-3 font-bold text-lg text-foreground">Community Guidelines</h3>
                    <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <li>Be respectful and civil in your discussions</li>
                        <li>Stay on topic and choose the appropriate category</li>
                        <li>No spam, self-promotion, or duplicate posts</li>
                        <li>Use clear, descriptive titles for your threads</li>
                        <li>Search before posting to avoid duplicates</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}