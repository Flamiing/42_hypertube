import React, { useState, useEffect } from "react";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../hooks/PageData/useLibrary";
import Spinner from "../../components/common/Spinner";
import SortSection from "./SortSection";
import FilterSection from "./FilterSection";
import calculateAge from "../../utils/calculateAge";
import ThumbnailBox from "./ThumbnailBox";
import MsgCard from "../../components/common/MsgCard";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const index = () => {
	const { user } = useAuth();
	const { profile } = useProfile(user?.id || "");
	/* const { getUserDistance, getBrowseUsers, loading, error } = useUsers();
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [sortBy, setSortBy] = useState("fame");
	const [sortOrder, setSortOrder] = useState("asc");
	const [noUsersFound, setNoUsersFound] = useState(false); */
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
		hasMore,
		loadingRef,
		initialLoad,
	} = useInfiniteScroll({
		fetchPage: getLibrary,
		initialPage: 1,
	});

	/* const applyFilters = (users, filters) => {
		// If all filters are null or empty, return all users
		const hasActiveFilters = Object.values(filters).some((value) => {
			if (Array.isArray(value)) {
				return value.length > 0;
			}
			return value !== null && value !== "" && value !== 0;
		});

		if (!hasActiveFilters) {
			return users;
		}

		return users.filter((user) => {
			const userAge = calculateAge(user.age);

			// Age filters
			if (filters.maxAge && userAge && userAge > filters.maxAge)
				return false;
			if (filters.minAge && userAge && userAge < filters.minAge)
				return false;

			// Distance filter
			if (filters.maxDistance) {
				const userDistance = userDistances[user.id];
				if (userDistance && userDistance > filters.maxDistance)
					return false;
			}

			// Fame filter
			if (filters.minFame && user.fame && user.fame < filters.minFame)
				return false;

			// Tags filter
			if (filters.tags && filters.tags.length > 0) {
				// Get array of user's tag IDs
				const userTagIds = user.tags.map((tag) => tag.id);
				// Check if user has ALL selected filter tags
				const hasAllTags = filters.tags.every((tagId) =>
					userTagIds.includes(tagId)
				);
				if (!hasAllTags) return false;
			}

			return true;
		});
	};

	const handleFilterChange = (newFilters) => {
		setActiveFilters(newFilters);
		// Apply filters first
		const filtered = applyFilters(users, newFilters);
		// Then sort the filtered results
		const sorted = sortUsers(filtered, sortBy, sortOrder);
		setFilteredUsers(sorted);
	};

	const sortUsers = (usersToSort, criteria, order) => {
		return [...usersToSort].sort((a, b) => {
			if (criteria === "location") {
				const distanceA = userDistances[a.id] || Infinity;
				const distanceB = userDistances[b.id] || Infinity;
				return order === "asc"
					? distanceB - distanceA
					: distanceA - distanceB;
			}

			let compareA = a[criteria];
			let compareB = b[criteria];

			if (criteria === "tags") {
				compareA = a.tags.length;
				compareB = b.tags.length;
			}

			if (criteria === "fame") {
				return order === "asc"
					? compareB - compareA
					: compareA - compareB;
			}

			return order === "asc"
				? compareA < compareB
					? 1
					: -1
				: compareA > compareB
				? 1
				: -1;
		});
	};

	const calculateDistances = async (users, profileLocation) => {
		const distances = {};
		for (const user of users) {
			if (user.location && profileLocation) {
				try {
					const location1 = { ...user.location };
					const location2 = { ...profileLocation };

					// Remove allows_location before sending to API
					delete location1.allows_location;
					delete location2.allows_location;

					const distance = await getUserDistance(
						location1,
						location2
					);
					distances[user.id] = distance;
				} catch (error) {
					console.error(
						`Error calculating distance for user ${user.id}:`,
						error
					);
					distances[user.id] = null;
				}
			} else {
				distances[user.id] = null;
			}
		}
		return distances;
	};

	const handleSort = (criteria) => {
		const newSortOrder =
			sortBy === criteria && sortOrder === "asc" ? "desc" : "asc";
		setSortBy(criteria);
		setSortOrder(newSortOrder);

		// Sort the filtered users
		const sorted = sortUsers(filteredUsers, criteria, newSortOrder);
		setFilteredUsers(sorted);
	};

	useEffect(() => {
		const fetchUsersAndCalculateDistances = async () => {
			const response = await getBrowseUsers();
			if (response.length === 0) {
				setNoUsersFound(true);
				setUsers([]);
				setFilteredUsers([]);
				return;
			}
			if (response && profile?.location) {
				const distances = await calculateDistances(
					response,
					profile.location
				);
				setUserDistances(distances);

				// Initial sort by fame
				const sortedUsers = [...response].sort(
					(a, b) => b.fame - a.fame
				);
				setUsers(sortedUsers);
				setFilteredUsers(sortedUsers);
			}
		};

		if (profile) fetchUsersAndCalculateDistances();
	}, [profile]); */

	/* if (loading) return <Spinner />; */
	/* if (error)
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>An error occurred when loading the library page</div>
			</main>
		); */
	if (!user || !profile) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div className="text-xl font-bold">
					You need to be logged in to view the library.
				</div>
			</main>
		);
	}

	if (movies.length > 0) {
		movies[0] = { ...movies[0], isWatched: true, isLiked: true };
	}

	console.log("Movies loaded:", movies);

	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full my-10">
			<h1 className="text-4xl font-bold">Library</h1>
			{/* <section className="container max-w-7xl px-4 flex flex-col w-full items-center xl:items-start gap-6">
				<FilterSection onFilterChange={handleFilterChange} />
				<SortSection
					sortUsers={handleSort}
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
			</section> */}
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
