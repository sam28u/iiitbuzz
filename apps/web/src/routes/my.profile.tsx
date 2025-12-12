import {
	ArrowLeft,
	Calendar,
	Eye,
	MapPin,
	MessageSquare,
	Settings,
	ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { useAuth } from "@/contexts/AuthContext";
import {
	mockUser,
	myProfileRecentActivity,
	myProfileRecentThreads,
	myProfileStats,
} from "@/data/mock";

export default function MyProfilePage() {
	const { user: authUser } = useAuth();
	const user = authUser || mockUser;

	const [activeTab, setActiveTab] = useState<"threads" | "activity">("threads");

	const displayUser = {
		username: user.username || "Anonymous",
		avatar: (user.username?.[0] || user.email[0] || "U").toUpperCase(),
		role: "Member",
		bio: user.bio || "No bio yet.",
		location: user.branch || "Unknown Dept",
		joinDate: "Joined recently",
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 flex-1">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
					<Link
						to="/home"
						className="mb-3 sm:mb-4 inline-flex items-center gap-2 font-bold text-sm text-primary hover:underline"
					>
						<ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
						Back to Forum
					</Link>
				</div>
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Left Sidebar - Profile Info */}
					<div className="lg:col-span-1">
						<div className="border-4 border-border bg-card p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
							{/* Avatar & Settings */}
							<div className="mb-4 flex items-start justify-between">
								<div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center border-4 border-border bg-primary font-bold text-3xl sm:text-4xl text-primary-foreground">
									{displayUser.avatar}
								</div>

								{/* Settings Link points to the settings route */}
								<Link to="/settings/profile">
									<button
										type="button"
										className="border-3 border-border bg-card p-2 shadow-[3px_3px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px]"
									>
										<Settings className="h-4 w-4 sm:h-5 sm:w-5" />
										<span className="sr-only">Edit Profile</span>
									</button>
								</Link>
							</div>

							{/* User Info */}
							<h1 className="mb-2 font-bold text-xl sm:text-2xl text-foreground">
								{displayUser.username}
							</h1>
							<div className="mb-4 rounded border-2 border-border bg-accent text-accent-foreground px-3 py-1 inline-block font-bold text-xs sm:text-sm">
								{displayUser.role}
							</div>

							<p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
								{displayUser.bio}
							</p>

							<div className="space-y-2 text-xs sm:text-sm text-foreground">
								<div className="flex items-center gap-2">
									<MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
									<span className="leading-tight">{displayUser.location}</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
									<span>{displayUser.joinDate}</span>
								</div>
							</div>
						</div>

						{/* Stats */}
						<div className="mt-6 border-4 border-border bg-card p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
							<h2 className="mb-4 font-bold text-lg sm:text-xl text-foreground">
								Statistics
							</h2>
							<div className="grid grid-cols-2 gap-3 sm:gap-4">
								<div className="border-3 border-border bg-primary text-primary-foreground p-3 sm:p-4 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)]">
									<div className="font-bold text-2xl sm:text-3xl">
										{user.totalPosts || 0}
									</div>
									<div className="mt-1 font-bold text-[10px] sm:text-xs">
										POSTS
									</div>
								</div>
								<div className="border-3 border-border bg-secondary text-secondary-foreground p-3 sm:p-4 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)]">
									<div className="font-bold text-2xl sm:text-3xl">
										{myProfileStats.threads}
									</div>
									<div className="mt-1 font-bold text-[10px] sm:text-xs">
										THREADS
									</div>
								</div>
								<div className="border-3 border-border bg-accent text-accent-foreground p-3 sm:p-4 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)]">
									<div className="font-bold text-2xl sm:text-3xl">
										{myProfileStats.likes}
									</div>
									<div className="mt-1 font-bold text-[10px] sm:text-xs">
										LIKES
									</div>
								</div>
								<div className="border-3 border-border bg-muted text-muted-foreground p-3 sm:p-4 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)]">
									<div className="font-bold text-2xl sm:text-3xl">
										{myProfileStats.solutions}
									</div>
									<div className="mt-1 font-bold text-[10px] sm:text-xs">
										SOLUTIONS
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Content - Threads & Activity */}
					<div className="lg:col-span-2">
						{/* Tabs */}
						<div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => setActiveTab("threads")}
								className={`border-4 border-border px-4 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all ${
									activeTab === "threads"
										? "bg-foreground text-background"
										: "bg-card text-foreground hover:opacity-80"
								}`}
							>
								My Threads
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("activity")}
								className={`border-4 border-border px-4 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all ${
									activeTab === "activity"
										? "bg-foreground text-background"
										: "bg-card text-foreground hover:opacity-80"
								}`}
							>
								Recent Activity
							</button>
						</div>

						{/* Content Area */}
						<div className="min-h-[400px]">
							{activeTab === "threads" && (
								<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
									<h2 className="mb-4 font-bold text-xl sm:text-2xl text-foreground">
										My Recent Threads
									</h2>
									<div className="space-y-3 sm:space-y-4">
										{myProfileRecentThreads.map((thread) => (
											<Link
												key={thread.id}
												to={`/thread/${thread.id}`}
												className="block"
											>
												<div className="border-4 border-border bg-card p-4 sm:p-5 shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px]">
													<div className="mb-2">
														<span
															className={`rounded border-2 border-border ${thread.categoryColor} px-2 py-0.5 font-bold text-xs`}
														>
															{thread.category}
														</span>
													</div>
													<h3 className="mb-3 font-bold text-base sm:text-xl leading-tight text-foreground">
														{thread.title}
													</h3>
													<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
														<span className="text-muted-foreground text-xs sm:text-sm">
															{thread.createdAt}
														</span>
														<div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
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
										{myProfileRecentThreads.length === 0 && (
											<div className="text-center py-12 text-muted-foreground border-4 border-border border-dashed p-8">
												<p className="text-lg">No threads yet</p>
											</div>
										)}
									</div>
								</div>
							)}

							{activeTab === "activity" && (
								<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
									<h2 className="mb-4 font-bold text-xl sm:text-2xl text-foreground">
										Recent Activity
									</h2>
									<div className="space-y-3">
										{myProfileRecentActivity.map((activity) => (
											<div
												key={activity.id}
												className="border-3 border-border bg-card p-3 sm:p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
											>
												<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
													<div className="flex-1 min-w-0">
														<div className="mb-1 font-bold text-sm sm:text-base text-foreground">
															{activity.action}
														</div>
														<div className="text-muted-foreground text-xs sm:text-sm leading-tight">
															{activity.threadTitle}
														</div>
													</div>
													<span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
														{activity.time}
													</span>
												</div>
											</div>
										))}
										{myProfileRecentActivity.length === 0 && (
											<div className="text-center py-12 text-muted-foreground border-4 border-border border-dashed p-8">
												<p className="text-lg">No activity yet</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
