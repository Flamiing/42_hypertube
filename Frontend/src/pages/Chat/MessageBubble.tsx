import React from "react";
import { Message } from "../../services/api/chat";

interface MessageBubbleProps {
	message: Message;
	isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
	const messageTime = new Date(message.createdAt);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderMessageContent = () => {
		switch (message.type) {
			case "audio":
				return (
					<audio controls className="max-w-full">
						<source src={message.message} type="audio/mpeg" />
						Your browser does not support the audio element.
					</audio>
				);
			case "text":
			default:
				return <p className="break-words">{message.message}</p>;
		}
	};

	return (
		<div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
			<div
				className={`max-w-[70%] rounded-lg px-4 py-2 ${
					isOwn
						? "bg-primary text-white rounded-br-none"
						: "bg-gray-100 text-gray-800 rounded-bl-none"
				}`}
			>
				{renderMessageContent()}
				<div
					className={`text-xs mt-1 ${
						isOwn ? "text-white/80 text-right" : "text-gray-500"
					}`}
				>
					{formatTime(messageTime)}
				</div>
			</div>
		</div>
	);
};

export default MessageBubble;
