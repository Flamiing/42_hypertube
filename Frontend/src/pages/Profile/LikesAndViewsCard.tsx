import React from "react";
import { timeAgo } from "../../hooks/timeAgo";
import { Link } from "react-router-dom";

const LikesAndViewsCard: React.FC = ({ profile }) => {
	return (
		<Link
			to={`/profile/view/${profile.username}`}
			className="hover:bg-gray-200 transition-all"
		>
			<div className="flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors">
				<img
					src={profile.profilePicture}
					alt={profile.username}
					className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
				/>
				<div className="flex-1 min-w-0">
					<p className="font-medium text-gray-900 truncate underline">
						{profile.username}
					</p>
					<p className="text-sm text-gray-500">
						{timeAgo(profile.time)}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default LikesAndViewsCard;
