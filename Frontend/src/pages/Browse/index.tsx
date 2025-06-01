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
import ISO6391 from "iso-639-1";

const index = () => {
	const { user } = useAuth();
	const { profile } = useProfile(user?.id || "");
	const { getLibrary, searchLibrary } = useLibrary();

	const [searchType, setSearchType] = useState("title");
	const [searchValue, setSearchValue] = useState("");
	const [orderBy, setOrderBy] = useState("title");
	const [orderType, setOrderType] = useState("asc");
	const [isSearchMode, setIsSearchMode] = useState(false);
	const [currentSearchParams, setCurrentSearchParams] = useState({});

	const createFetchFunction = (searchParams = {}) => {
		if (Object.keys(searchParams).length > 0) {
			return (page: number) => searchLibrary(page, searchParams);
		}
		return getLibrary;
	};

	const {
		items: movies,
		loading,
		error,
		hasMore,
		loadingRef,
		initialLoad,
		resetItems,
	} = useInfiniteScroll({
		fetchPage: createFetchFunction(currentSearchParams),
		initialPage: 1,
	});

	if (movies.length > 0) {
		movies[0] = { ...movies[0], isWatched: true, isLiked: true };
	}

	const searchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchType(e.target.value);
	};

	const searchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	};

	const handleSearchSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		if (!searchValue.trim()) {
			// If search is empty, return to normal library view
			setIsSearchMode(false);
			setCurrentSearchParams({});
			resetItems();
			return;
		}

		let searchParams: any = {};

		if (searchType === "genres") {
			// For genres, split by comma and create array format
			const genres = searchValue
				.split(",")
				.map((g) => g.trim())
				.filter((g) => g);
			searchParams = { "genres[]": genres };
		} else if (searchType === "language") {
			// For language, language name to iso code
			const isoCode = ISO6391.getCode(searchValue);
			if (isoCode) {
				searchParams.language = isoCode;
			} else {
				// If invalid language, leave as is
				searchParams.language = searchValue;
			}
		} else {
			searchParams[searchType] = searchValue;
		}

		setIsSearchMode(true);
		setCurrentSearchParams(searchParams);
		resetItems();
	};

	const handleSort = (sortBy: string, sortOrder: string) => {
		setOrderBy(sortBy);
		setOrderType(sortOrder);
	};

	useEffect(() => {
		if (isSearchMode && Object.keys(currentSearchParams).length > 0) {
			resetItems();
		}
	}, [currentSearchParams, isSearchMode]);

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
				<Search
					searchType={searchType}
					searchValue={searchValue}
					searchTypeChange={searchTypeChange}
					searchValueChange={searchValueChange}
					onSearchSubmit={handleSearchSubmit}
				/>
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
					{movies.length === 0 && !loading && (
						<h2 className="col-span-full text-center text-xl font-bold w-full">
							{isSearchMode
								? "No movies found matching your search. Try different keywords."
								: "There are no movies to show. Try changing your filters."}
						</h2>
					)}
					{/* Loaded movies and infinite scroll */}
					{Array.isArray(movies) &&
						movies.map((movie, index) => (
							<ThumbnailBox
								key={`${movie.id}-${index}`}
								movie={movie}
							/>
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
