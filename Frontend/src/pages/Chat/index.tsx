import React, { useState, useEffect } from "react";
import { useBreakpoints } from "../../hooks/useBreakpoints";
import ChatMessages from "./ChatMessages";
import ChatsList from "./ChatsList";
import { useChat } from "../../hooks/PageData/useChat";
import Spinner from "../../components/common/Spinner";
import MsgCard from "../../components/common/MsgCard";
import { useSocket } from "../../context/SocketContext";
import { Link } from "react-router-dom";

const index: React.FC = () => {
	const { isMobile, isTablet, isDesktop } = useBreakpoints();
	const { chats, getAllChats, loading, error } = useChat();
	const { isConnected } = useSocket();
	const [selectedChat, setSelectedChat] = useState<string | null>(null);
	const [isChatVisible, setIsChatVisible] = useState<boolean>(isDesktop);

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const handleChangeChat = (chatId: string) => {
		setSelectedChat(chatId);
		if (!isDesktop) {
			setIsChatVisible(true);
		}
	};

	const handleBackToChatList = () => {
		setIsChatVisible(false);
		setSelectedChat(null);
	};

	const handleSocketError = (error: any) => {
		setMsg({
			type: "error",
			message: error.message || "An error occurred",
			key: Date.now(),
		});
	};

	// Initial fetch of chats
	useEffect(() => {
		const fetchChats = async () => {
			try {
				await getAllChats();
			} catch (err: any) {
				setMsg({
					type: "error",
					message: err.message || "Failed to load chats",
					key: Date.now(),
				});
			}
		};

		fetchChats();
	}, []);

	// Periodic refresh of chat list to catch any updates
	useEffect(() => {
		const intervalId = setInterval(() => {
			if (isConnected) {
				getAllChats().catch((err) => {
					console.error("Failed to refresh chats:", err);
				});
			}
		}, 10000);

		return () => clearInterval(intervalId);
	}, [isConnected, getAllChats]);

	useEffect(() => {
		setIsChatVisible(isDesktop || (selectedChat !== null && !isDesktop));
	}, [isDesktop]);

	if (loading && chats.length === 0) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<Spinner />
			</main>
		);
	}

	if (error && chats.length === 0) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>An error occurred when loading the chat page</div>
			</main>
		);
	}

	const selectedChatData = selectedChat
		? chats.find((chat) => chat.chatId === selectedChat)
		: null;

	const chatPartner = selectedChatData
		? {
				username: selectedChatData.receiverUsername,
				profilePicture: selectedChatData.receiverProfilePicture,
		  }
		: undefined;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}

			<section className="container max-w-7xl px-4 flex flex-row justify-between w-full items-center">
				<h1 className="text-4xl font-bold my-10 flex items-center">
					{!isDesktop && isChatVisible && selectedChatData ? (
						<button
							onClick={handleBackToChatList}
							className="mr-2 inline-flex items-center"
						>
							<i className="fa fa-arrow-left text-2xl" />
						</button>
					) : null}
					<span>
						Chat
						{selectedChatData ? (
							<>
								{" with "}
								<span className="underline text-primary font-extrabold">
									<Link
										to={`/profile/view/${chatPartner?.username}`}
									>
										{chatPartner?.username}
									</Link>
								</span>
							</>
						) : (
							""
						)}
					</span>
				</h1>
			</section>

			<section className="container max-w-7xl my-10 px-4 flex-grow flex gap-5">
				{/* Mobile/Tablet View - Either show chat list or messages */}
				{!isDesktop ? (
					isChatVisible && selectedChat ? (
						<ChatMessages
							chatId={selectedChat}
							chatPartner={chatPartner}
							onSocketError={handleSocketError}
						/>
					) : (
						<ChatsList
							chats={chats}
							selectedChat={selectedChat}
							onChangeChat={handleChangeChat}
						/>
					)
				) : (
					/* Desktop View - Show both side by side */
					<>
						<ChatsList
							chats={chats}
							selectedChat={selectedChat}
							onChangeChat={handleChangeChat}
						/>
						<ChatMessages
							chatId={selectedChat}
							chatPartner={chatPartner}
							onSocketError={handleSocketError}
						/>
					</>
				)}
			</section>
		</main>
	);
};

export default index;
