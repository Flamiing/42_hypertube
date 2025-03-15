import React, { useState, useEffect } from "react";
import { useUsers } from "../../hooks/PageData/useUsers";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/common/Spinner";
import SortSection from "./SortSection";
import UserCard from "./UserCard";
import FilterSection from "./FilterSection";
import calculateAge from "../../utils/calculateAge";

const index = () => {
	const { user } = useAuth();
	const { profile } = useProfile(user?.id || "");
	const { getUserDistance, getBrowseUsers, loading, error } = useUsers();
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [sortBy, setSortBy] = useState("fame");
	const [sortOrder, setSortOrder] = useState("asc");
	const [userDistances, setUserDistances] = useState({});
	const [noUsersFound, setNoUsersFound] = useState(false);
	const [activeFilters, setActiveFilters] = useState({
		maxAge: null,
		minAge: null,
		maxDistance: null,
		minFame: null,
	});

	const applyFilters = (users, filters) => {
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
	}, [profile]);

	if (loading) return <Spinner />;
	if (error)
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>An error occurred when loading the browse page</div>
			</main>
		);
	if (!user || !profile) return <div>Error: User not found</div>;

	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full my-10">
			<section className="container max-w-7xl px-4 flex flex-col w-full items-center xl:items-start gap-6">
				<h1 className="text-4xl font-bold">Browse</h1>
				<FilterSection onFilterChange={handleFilterChange} />
				<SortSection
					sortUsers={handleSort}
					sortBy={sortBy}
					sortOrder={sortOrder}
				/>
			</section>
			{/* Users Grid */}
			<section className="container max-w-7xl px-4 flex flex-row justify-between w-full items-center flex-grow">
				<div className="flex flex-wrap md:justify-start justify-center gap-x-8 gap-y-10 w-full">
					{noUsersFound ? (
						<h2 className="col-span-full text-center text-xl font-bold w-full">
							There are no interesting profiles for you. We are
							sorry :(
						</h2>
					) : (
						filteredUsers.length === 0 && (
							<h2 className="col-span-full text-center text-xl font-bold w-full">
								No users fit the criteria
							</h2>
						)
					)}
					{filteredUsers.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							distance={userDistances[user.id]}
						/>
					))}
				</div>
			</section>
		</main>
	);
};

export default index;
