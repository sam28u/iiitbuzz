import { Eye, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { categories, homeRecentThreads } from "@/data/mock";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 flex-1">
				{/* Categories Section */}
				<section className="mb-8 sm:mb-12">
					<h2 className="mb-4 sm:mb-6 font-bold text-2xl sm:text-3xl text-foreground">
						Categories
					</h2>
					<div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{categories.map((category) => (
							<Link
								key={category.id}
								to={`/category/${category.id}`}
								className="group block"
							>
								<div className="border-4 border-border bg-card text-card-foreground p-4 sm:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-all hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[4px] hover:translate-y-[4px]">
									<div className="mb-3 sm:mb-4 flex items-center gap-3">
										<div
											className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-3 border-border ${category.color} text-xl sm:text-2xl flex-shrink-0`}
										>
											{category.icon}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-lg sm:text-xl truncate">
												{category.name}
											</h3>
										</div>
									</div>
									<p className="mb-3 sm:mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">
										{category.description}
									</p>
									<div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-bold">
										<span className="flex items-center gap-1">
											<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
											<span className="whitespace-nowrap">
												{category.topics} Topics
											</span>
										</span>
										<span className="text-muted-foreground whitespace-nowrap">
											{category.posts} Posts
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
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
				<div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-3">
					<div className="border-4 border-border bg-primary text-primary-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
						<div className="font-bold text-3xl sm:text-4xl">616</div>
						<div className="mt-1 font-bold text-xs sm:text-sm">
							TOTAL TOPICS
						</div>
					</div>
					<div className="border-4 border-border bg-secondary text-secondary-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
						<div className="font-bold text-3xl sm:text-4xl">9.7K</div>
						<div className="mt-1 font-bold text-xs sm:text-sm">TOTAL POSTS</div>
					</div>
					<div className="border-4 border-border bg-accent text-accent-foreground p-4 sm:p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
						<div className="font-bold text-3xl sm:text-4xl">1.2K</div>
						<div className="mt-1 font-bold text-xs sm:text-sm">MEMBERS</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
