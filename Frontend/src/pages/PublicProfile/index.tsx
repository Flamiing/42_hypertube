import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { usePublicProfile } from "../../hooks/PageData/usePublicProfile";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useUsers } from "../../hooks/PageData/useUsers";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/common/Spinner";
import ProfileHeader from "./ProfileHeader";
import ProfileDetails from "./ProfileDetails";
import Images from "../../components/profile/Images";
import Info from "../../components/profile/Info";
import TagSection from "../../components/profile/TagSection";
import LikeButton from "../../components/profile/LikeButton";

const index = () => {
	const { username } = useParams<{ username: string }>();
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const {
		profile,
		loading: profileLoading,
		error: profileError,
		notFound,
	} = usePublicProfile(username || "");
	const { profile: currentUserProfile, loading: currentUserLoading } =
		useProfile(user?.id);
	const { getUserDistance } = useUsers();

	const [userProfile, setUserProfile] = useState(profile);
	const [distance, setDistance] = useState<number | null>(null);

	useEffect(() => {
		setUserProfile(profile);
	}, [profile]);

	useEffect(() => {
		const calculateDistance = async () => {
			if (
				isAuthenticated &&
				profile?.location &&
				currentUserProfile?.location
			) {
				try {
					const location1 = { ...profile.location };
					const location2 = { ...currentUserProfile.location };

					// Remove allows_location before sending to API
					delete location1.allows_location;
					delete location2.allows_location;

					const calculatedDistance = await getUserDistance(
						location1,
						location2
					);
					setDistance(calculatedDistance);
				} catch (error) {
					console.error("Error calculating distance:", error);
					setDistance(null);
				}
			}
		};

		calculateDistance();
	}, [profile, currentUserProfile, isAuthenticated]);

	const handleProfileUpdate = (updatedData) => {
		setUserProfile((prev) => ({ ...prev, ...updatedData }));
	};

	if (authLoading) {
		return <Spinner />;
	}

	// If this is the current user's profile, redirect to /profile
	if (user?.username === username) {
		return <Navigate to="/profile" replace />;
	}

	// Only check profile loading states after auth is complete
	const isLoading = profileLoading || (isAuthenticated && currentUserLoading);

	if (isLoading) return <Spinner />;
	if (notFound) return <Navigate to="/404" replace />;
	if (profileError) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>Error: {profileError}</div>
			</main>
		);
	}
	if (!userProfile) return null;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="w-full bg-gradient-to-br from-red-200 to-purple-200 flex flex-col items-center gap-12">
				<ProfileHeader
					user={userProfile}
					onProfileUpdate={handleProfileUpdate}
					distance={distance}
				/>
				<ProfileDetails user={userProfile} />
				<section className="flex flex-wrap flex-row w-fit items-center justify-center mb-10 gap-7 px-4">
					<Images user={userProfile} />
					<LikeButton
						user={userProfile}
						initialLiked={userProfile.liked}
						onProfileUpdate={handleProfileUpdate}
					/>
				</section>
			</section>
			<Info user={userProfile} />
			<TagSection tags={userProfile.tags} />
		</main>
	);
};

export default index;
