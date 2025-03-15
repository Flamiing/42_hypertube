import React from "react";
import ChatCard from "./ChatCard";
import { ChatPreview } from "../../services/api/chat";

interface ChatsListProps {
	chats: ChatPreview[];
	selectedChat: string | null;
	onChangeChat: (chatId: string) => void;
}

const ChatsList: React.FC<ChatsListProps> = ({
	chats,
	selectedChat,
	onChangeChat,
}) => {
	return (
		<div className="w-full lg:w-fit">
			<div className="border rounded-lg shadow-sm bg-white overflow-hidden">
				<div className="max-h-[600px] overflow-y-auto lg:w-80 w-full">
					{chats.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{chats.map((chat) => (
								<ChatCard
									key={chat.chatId}
									chat={chat}
									isSelected={selectedChat === chat.chatId}
									onClick={onChangeChat}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-10 px-4 text-center">
							<h3 className="text-lg font-medium text-font-main mb-1">
								You must match with someone to get the
								conversation started
							</h3>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatsList;
