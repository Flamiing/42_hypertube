import React from "react";
import { timeAgo } from "../../hooks/timeAgo";
import { ChatPreview } from "../../services/api/chat";

interface ChatCardProps {
	chat: ChatPreview;
	isSelected: boolean;
	onClick: (chatId: string) => void;
}

const ChatCard: React.FC<ChatCardProps> = ({ chat, isSelected, onClick }) => {
	const handleClick = () => {
		onClick(chat.chatId);
	};

	// Format timestamp from the API to display in timeAgo format
	const getTimeDisplay = () => {
		const timestamp = new Date(chat.updatedAt || chat.createdAt).getTime();
		return timeAgo(timestamp);
	};

	return (
		<div
			className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 w-full ${
				isSelected
					? "bg-blue-50 border-l-4 border-tertiary"
					: "hover:bg-gray-50 border-l-4 border-transparent"
			}`}
			onClick={handleClick}
		>
			<div className="relative">
				<img
					className="w-14 h-14 rounded-full object-cover hover:scale-105 transition-transform shadow-md border-2 border-solid border-primary"
					src={chat.receiverProfilePicture}
					alt={`${chat.receiverUsername}'s profile`}
				/>
			</div>

			<div className="ml-4 flex-grow">
				<div className="flex justify-between items-center">
					<h3 className="font-medium text-gray-900 truncate max-w-[120px]">
						{chat.receiverUsername}
					</h3>
					<span className="text-xs flex-shrink-0">
						<p className="text-gray-500">Last activity:</p>
						{getTimeDisplay()}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ChatCard;
