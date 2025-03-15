import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	sendMessage: (chatId: string, receiverId: string, message: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};

interface SocketProviderProps {
	children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const { isAuthenticated, user } = useAuth();

	// Initialize socket connection when the user is authenticated
	useEffect(() => {
		if (!isAuthenticated || !user) {
			if (socket) {
				socket.disconnect();
				setSocket(null);
				setIsConnected(false);
			}
			return;
		}

		const socketInstance = io("http://localhost:3001", {
			withCredentials: true,
		});

		socketInstance.on("connect", () => {
			console.log("Socket connected");
			setIsConnected(true);
		});

		socketInstance.on("disconnect", () => {
			console.log("Socket disconnected");
			setIsConnected(false);
		});

		socketInstance.on("error-info", (error) => {
			console.error("Socket error:", error);
		});

		setSocket(socketInstance);

		// Cleanup
		return () => {
			socketInstance.disconnect();
			setSocket(null);
			setIsConnected(false);
		};
	}, [isAuthenticated, user]);

	const sendMessage = (
		chatId: string,
		receiverId: string,
		message: string
	) => {
		if (socket && isConnected) {
			socket.emit("send-text-message", {
				chatId,
				receiverId,
				message,
			});
		} else {
			throw new Error("Socket is not connected");
		}
	};

	const sendAudioMessage = (
		chatId: string,
		receiverId: string,
		message: String
	) => {
		if (socket && isConnected) {
			socket.emit("send-audio-message", {
				chatId,
				receiverId,
				message,
			});
		} else {
			throw new Error("Socket is not connected");
		}
	};

	return (
		<SocketContext.Provider
			value={{ socket, isConnected, sendMessage, sendAudioMessage }}
		>
			{children}
		</SocketContext.Provider>
	);
};
