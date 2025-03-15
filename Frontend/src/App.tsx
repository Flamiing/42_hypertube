import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
	return (
		<AuthProvider>
			<SocketProvider>
				<RouterProvider
					future={{ v7_startTransition: true }}
					router={router}
				/>
			</SocketProvider>
		</AuthProvider>
	);
}

export default App;
