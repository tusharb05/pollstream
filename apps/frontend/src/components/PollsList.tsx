"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import PollCard from "./PollCard";
import axios from "axios";

interface PollOption {
	id: number;
	text: string;
	vote_count: number;
	voted: boolean;
}

interface Poll {
	id: number;
	title: string;
	creator_name: string;
	created_at: string;
	end_time: string;
	has_voted: boolean;
	options: PollOption[];
}

interface PollsResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: Poll[];
}

export default function PollsList() {
	const { fullName } = useUser();
	const { addToast } = useToast();
	const [polls, setPolls] = useState<Poll[]>([]);
	const [loading, setLoading] = useState(false);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const isFetchingRef = useRef(false);

	const fetchPolls = useCallback(
		async (url?: string) => {
			if (isFetchingRef.current || !fullName) return;
			isFetchingRef.current = true;
			setLoading(true);

			try {
				const apiUrl = url || "http://localhost:8001/api/polls/get-list/";
				const response = await axios.get<PollsResponse>(apiUrl, {
					params: {
						full_name: fullName,
					},
				});

				const { results, next } = response.data;

				setPolls((prev) => (url ? [...prev, ...results] : results));
				setNextUrl(next);
				setHasMore(!!next);
			} catch (error) {
				console.error("Error fetching polls:", error);
				addToast("Failed to load polls", "error");
			} finally {
				setLoading(false);
				isFetchingRef.current = false;
			}
		},
		[fullName, addToast]
	);

	useEffect(() => {
		if (fullName) {
			fetchPolls();
		}
	}, [fullName]); // Only depend on fullName, not fetchPolls

	const loadMore = useCallback(() => {
		if (nextUrl && hasMore && !isFetchingRef.current) {
			fetchPolls(nextUrl);
		}
	}, [nextUrl, hasMore, fetchPolls]);

	const lastPollElementRef = useInfiniteScroll(loadMore, hasMore && !loading);

	const handleVote = async (pollId: number, optionId: number) => {
		try {
			await axios.post(`http://localhost:8002/api/vote/`, {
				option_id: optionId,
				poll_id: pollId,
				voter_name: fullName,
			});

			// Update local state
			setPolls((prev) =>
				prev.map((poll) =>
					poll.id === pollId
						? {
								...poll,
								has_voted: true,
								options: poll.options.map((option) => ({
									...option,
									voted: option.id === optionId,
									vote_count:
										option.id === optionId
											? option.vote_count + 1
											: option.vote_count,
								})),
							}
						: poll
				)
			);

			addToast("Vote submitted successfully!", "success");
		} catch (error) {
			console.error("Error voting:", error);
			addToast("Failed to submit vote", "error");
		}
	};

	if (!fullName) {
		return null;
	}

	return (
		<div className="space-y-6">
			{polls.map((poll, index) => (
				<div
					key={poll.id}
					ref={index === polls.length - 1 ? lastPollElementRef : null}>
					<PollCard poll={poll} onVote={handleVote} />
				</div>
			))}

			{loading && (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			)}

			{!hasMore && polls.length > 0 && (
				<div className="text-center py-8 text-gray-500">
					No more polls to load
				</div>
			)}

			{polls.length === 0 && !loading && (
				<div className="text-center py-12">
					<div className="text-gray-500 text-lg">No polls available yet</div>
					<div className="text-gray-400 text-sm mt-2">
						Be the first to create one!
					</div>
				</div>
			)}
		</div>
	);
}
