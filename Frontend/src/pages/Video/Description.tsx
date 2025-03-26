import React from "react";

const Description: React.FC = ({ writers, stars }) => {
	return (
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
						<span className="text-font-main">{"8.3"}</span>/{"10"}
					</p>
				</div>
			</div>
			<div>
				<div className="flex gap-4 flex-wrap items-center">
					<label htmlFor="" className="text-lg underline">
						Director
					</label>
					<p>{"Christopher Nolan"}</p>
				</div>
				<div className="flex gap-4 flex-wrap items-center">
					<label htmlFor="" className="text-lg underline">
						Writer{writers.length > 1 && "s"}
					</label>
					<p>
						{writers.map((writer, index) => (
							<span key={index}>
								{writer}
								{index < writers.length - 1 && <span>, </span>}
							</span>
						))}
					</p>
				</div>
				<div className="flex gap-4 flex-wrap items-center">
					<label htmlFor="" className="text-lg underline">
						Star{stars.length > 1 && "s"}
					</label>
					<p>
						{stars.map((star, index) => (
							<span key={index}>
								{star}
								{index < stars.length - 1 && <span>, </span>}
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
	);
};

export default Description;
