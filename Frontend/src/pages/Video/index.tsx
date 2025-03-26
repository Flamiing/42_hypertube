import React from "react";

const index: React.FC = () => {
	const writers = ["Christopher Nolan", "Kai Bird", "Martin Sherwin"];

	const stars = ["Cillian Murphy", "Emily Blunt", "Matt Damon"];

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<div className="">
						<video
							className="w-full rounded-lg"
							controls
							src="https://imdb-video.media-imdb.com/vi2053751833/1434659607842-pgv4ql-1683541736696.mp4?Expires=1742370275&Signature=a4Q8x99IIIBdPPKUavgRI3HigowpiBZosRIoj9WCQWZ3RYgvrn8-t-8kLw7bAW-soZ4tsnJLY7GkVN4Y6zDOga5co~GvQNEl2GHiveUBwzohVCQwGd6ozp4wqI4G0FCgVUCiKqGlBsODcoLzvAkpEb9n38BOXmXkCcd2qkoxSGSZMCKF11wRMpYSqg15ODXNaSMtGfDE6ANTIrMxiKY~Vigy9d~H8eGMO2DM3G5v75lxI09QzbPIJV1y-Nc7ECpkSpDgyTW-7ZPWE9TteUXMQu6fikjilEYfG9gBFqWirop9nq68hlDoNduweTw47zyxKD8FoMWdI~cUqzaT84o~2g__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA"
						></video>
					</div>
					<div className="w-full bg-background-secondary p-4 rounded-lg flex flex-col gap-4 mb-7">
						<div className="relative">
							<h2 className="text-2xl font-semibold">
								{"Oppenheimer"}
								<span> | </span>
								<span className="text-font-secondary text-xl">
									{"2023"}
								</span>
							</h2>
							<p>Length: {"3h"}</p>
							<div className="absolute right-0 top-0 flex items-center flex-col">
								<p>IMDb rating</p>
								<p className="text-font-secondary">
									<i className="fas fa-star text-yellow-400 text-xl pr-2" />
									<span className="text-font-main">
										{"8.3"}
									</span>
									/{"10"}
								</p>
							</div>
						</div>
						<div>
							<div className="flex gap-4">
								<label htmlFor="" className="text-lg underline">
									Director
								</label>
								<p>{"Christopher Nolan"}</p>
							</div>
							<div className="flex gap-4">
								<label htmlFor="" className="text-lg underline">
									Writers
								</label>
								<p>
									{writers.map((writer, index) => (
										<span key={index}>
											{writer}
											{index < writers.length - 1 && (
												<span>, </span>
											)}
										</span>
									))}
								</p>
							</div>
							<div className="flex gap-4">
								<label htmlFor="" className="text-lg underline">
									Stars
								</label>
								<p>
									{stars.map((star, index) => (
										<span key={index}>
											{star}
											{index < stars.length - 1 && (
												<span>, </span>
											)}
										</span>
									))}
								</p>
							</div>
						</div>
						<div>
							<label htmlFor="" className="text-lg underline">
								Summary
							</label>
							<p>
								{
									"A dramatization of the life story of J. Robert Oppenheimer, the physicist who had a large hand in the development of the atomic bombs that brought an end to World War II."
								}
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
};

export default index;
