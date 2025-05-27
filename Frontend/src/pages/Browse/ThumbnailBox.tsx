import React from "react";

const ThumbnailBox: React.FC = ({ movie }) => {
	const handleClick = () => {
		console.log("Movie clicked:", movie.id);
	};

	return (
		<div
			onClick={handleClick}
			className="w-72 bg-white rounded-lg shadow-md p-6 overflow-hidden hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 flex flex-col"
		>
			<img
				src={movie.thumbnail}
				alt={movie.title}
				className="w-full h-fit"
			/>
			<h2 className="text-xl font-semibold mt-4 break-words">
				{movie.title}
				{movie.year && (
					<>
						<span> - </span>
						<span className="text-lg text-gray-400">
							{movie.year}
						</span>
					</>
				)}
			</h2>
			{movie.rating && movie.rating > 0 && (
				<p className="mt-2">
					<span className="text-yellow-400 mr-1">★</span>
					<span>{Math.round(movie.rating * 10) / 10}</span>
					<span className="text-gray-400">/{"10"}</span>
				</p>
			)}
		</div>
	);
};

export default ThumbnailBox;
