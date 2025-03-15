import React from "react";
import Modal from "../../components/common/Modal";
import LikesAndViewsCard from "./LikesAndViewsCard";

interface OtherUsers {
	first_name: string;
	profile_picture: string;
	time: string;
}

interface User {
	first_name: string;
	likes: number;
	likedProfiles: OtherUsers[];
	views: number;
	viewedProfiles: OtherUsers[];
}

const LikesAndViews: React.FC = ({ profileLikes, profileViews }) => {
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [activeTab, setActiveTab] = React.useState("likes");

	const handleTabChange = (tab) => {
		setActiveTab(tab);
	};

	return (
		<div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<div className="flex flex-col w-full h-[90vh] overflow-y-scroll rounded-lg">
					{/* Header */}
					<div className="flex items-center justify-between p-3 md:p-4 border-b bg-white">
						<h3 className="text-lg md:text-xl font-semibold text-gray-900">
							Profile Activity
						</h3>
						<button
							onClick={() => setIsModalOpen(false)}
							className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<span className="fa fa-close" />
						</button>
					</div>
					{/* Body */}
					<div className="p-4 md:p-6">
						{/* Tabs */}
						<div className="flex border-b bg-white sticky top-0 z-10">
							<button
								className={`flex-1 py-2.5 md:py-3 px-4 text-sm font-medium transition-colors ${
									activeTab === "likes"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("likes")}
							>
								<span className="fa fa-heart" /> Likes (
								{profileLikes.length})
							</button>
							<button
								className={`flex-1 py-2.5 md:py-3 px-4 text-sm font-medium transition-colors ${
									activeTab === "views"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => handleTabChange("views")}
							>
								<span className="fa fa-eye" /> Views (
								{profileViews.length})
							</button>
						</div>
						{/* Content */}
						<div className="flex-1 overflow-y-auto overscroll-contain bg-white">
							<div className="divide-y divide-gray-200">
								{activeTab === "likes" ? (
									profileLikes.length > 0 ? (
										profileLikes.map((profile, index) => (
											<LikesAndViewsCard
												key={`like-${index}`}
												profile={profile}
											/>
										))
									) : (
										<div className="p-4 text-center text-gray-500">
											No likes yet
										</div>
									)
								) : profileViews.length > 0 ? (
									profileViews.map((profile, index) => (
										<LikesAndViewsCard
											key={`view-${index}`}
											profile={profile}
										/>
									))
								) : (
									<div className="p-4 text-center text-gray-500">
										No views yet
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</Modal>

			{/* Trigger Button */}
			<button
				onClick={() => setIsModalOpen(true)}
				className="inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200"
			>
				<span className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
					<span className="fa fa-heart" />
					Your likes & views
				</span>
			</button>
		</div>
	);
};

export default LikesAndViews;
