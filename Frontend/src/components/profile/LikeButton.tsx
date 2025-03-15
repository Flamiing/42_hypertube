import { useState, useEffect } from "react";
import { useUsers } from "../../hooks/PageData/useUsers";
import MsgCard from "../../components/common/MsgCard";

interface LikeButtonProps {
	user: any;
	initialLiked?: boolean;
	onProfileUpdate: (data: any) => void;
}

const LikeButton = ({
	user,
	initialLiked,
	onProfileUpdate,
}: LikeButtonProps) => {
	const { likeUser } = useUsers();
	const [isLiked, setIsLiked] = useState(initialLiked);
	const [isLoading, setIsLoading] = useState(false);
	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	// update like state when user gets blocked
	useEffect(() => {
		if (user.blocked) {
			setIsLiked(false);
		}
	}, [user.blocked]);

	// update like state when initialLiked changes
	useEffect(() => {
		setIsLiked(initialLiked);
	}, [initialLiked]);

	const handleLikeClick = async () => {
		if (isLoading) return;

		setIsLoading(true);
		try {
			await likeUser(user.id);
			const newLikedState = !isLiked;
			setIsLiked(newLikedState);
			onProfileUpdate({ liked: newLikedState });
		} catch (err) {
			setMsg({
				type: "error",
				message: err.message,
				key: Date.now(),
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<button
				onClick={handleLikeClick}
				disabled={isLoading || user.blocked}
				className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg p-0.5 font-medium focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-300 disabled:hover:text-gray-300
		${
			isLiked
				? "bg-gradient-to-br from-red-500 to-pink-500 text-white hover:bg-gradient-to-bl"
				: "bg-gradient-to-br from-purple-500 to-pink-500 text-gray-900 hover:text-white"
		}`}
			>
				<span
					className={`flex items-center gap-2 rounded-md px-5 py-2.5 transition-all duration-75 ease-in ${
						isLiked
							? "bg-transparent"
							: "bg-white group-hover:bg-opacity-0"
					}`}
				>
					<span
						className={`${isLiked ? "fa fa-heart" : "fa-regular fa-heart"}`}
					/>
					{isLiked ? "Liked" : "Like"}
				</span>
			</button>
		</>
	);
};

export default LikeButton;
