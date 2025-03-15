import React from "react";
import SortButton from "./SortButton";

const SortSection: React.FC = ({ sortUsers, sortBy, sortOrder }) => {
	return (
		<div className="w-full mb-8 flex md:justify-start justify-center">
			<div className="flex space-x-4 justify-center flex-wrap border rounded-lg w-fit shadow-sm bg-background-main">
				<SortButton
					sortUsers={sortUsers}
					criteria="fame"
					icon={<span className="mr-2 text-lg ">🔥</span>}
					label="Fame"
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
				<SortButton
					sortUsers={sortUsers}
					criteria="age"
					icon={<i className="fa fa-birthday-cake text-pink-500" />}
					label="Age"
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
				<SortButton
					sortUsers={sortUsers}
					criteria="location"
					icon={<i className="fa fa-map-marker text-red-500" />}
					label="Location"
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
				<SortButton
					sortUsers={sortUsers}
					criteria="tags"
					icon={<i className="fa fa-tags text-blue-500" />}
					label="Common Tags"
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
			</div>
		</div>
	);
};

export default SortSection;
