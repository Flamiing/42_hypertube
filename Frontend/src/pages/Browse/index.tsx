import React, { useState, useEffect } from "react";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../hooks/PageData/useLibrary";
import Spinner from "../../components/common/Spinner";
import SortSection from "./SortSection";
import FilterSection from "./FilterSection";
import Search from "./Search";
import calculateAge from "../../utils/calculateAge";
import ThumbnailBox from "./ThumbnailBox";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import MsgCard from "../../components/common/MsgCard";

const index = () => {
	const { user } = useAuth();
	const { profile } = useProfile(user?.id || "");
	const [activeFilters, setActiveFilters] = useState({
		title: null,
		year: null,
		rating: null,
		popularity: null,
		language: null,
	});

	const { getLibrary } = useLibrary();

	const {
		items: movies,
		loading,
		error,
		hasMore,
		loadingRef,
		initialLoad,
	} = useInfiniteScroll({
		fetchPage: getLibrary,
		initialPage: 1,
	});

	if (movies.length > 0) {
		movies[0] = { ...movies[0], isWatched: true, isLiked: true };
	}

	console.log("Movies loaded:", movies);

	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full my-10">
			{error && (
				<MsgCard
					title="Error loading library"
					message={error}
					type="error"
				/>
			)}

			<h1 className="text-4xl font-bold">Library</h1>
			<section className="container max-w-7xl px-4 flex flex-col w-full items-center xl:items-start gap-6">
				<Search />
				{/* <FilterSection onFilterChange={handleFilterChange} />
				<SortSection
					sortUsers={handleSort}
					sortBy={sortBy}
					sortOrder={sortOrder}
				/> */}
			</section>
			<section className="container max-w-7xl pt-10 px-4 flex flex-row justify-between w-full items-center flex-grow">
				<div className="flex flex-wrap md:justify-start justify-center gap-x-8 gap-y-10 w-full">
					{/* No movies to load */}
					{movies.length === 0 && (
						<h2 className="col-span-full text-center text-xl font-bold w-full">
							There are no movies to show. Try changing your
							filters.
						</h2>
					)}
					{/* Loaded movies and infinite scroll */}
					{Array.isArray(movies) &&
						movies.map((movie, index) => (
							<ThumbnailBox key={index} movie={movie} />
						))}
					{hasMore && !initialLoad && (
						<div
							ref={loadingRef}
							className="w-full flex justify-center py-8"
						>
							{loading && <Spinner />}
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default index;
