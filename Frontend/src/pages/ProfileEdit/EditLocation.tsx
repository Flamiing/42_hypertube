import React, { useState } from "react";
import RegularButton from "../../components/common/RegularButton";
import getLocation from "../../services/geoLocation/allowed";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";
import MsgCard from "../../components/common/MsgCard";
import Spinner from "../../components/common/Spinner";

const EditLocation: React.FC = ({ user }) => {
	const [allowedLocation, setAllowedLocation] = useState(
		user.location?.allows_location ?? false
	);
	const { updateLocation, loading } = useEditProfile();

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const onSubmit = async () => {
		try {
			const location = await getLocation();
			if (!location)
				throw new Error(
					"Access to location denied. Could not update location."
				);

			await updateLocation({
				latitude: location.latitude,
				longitude: location.longitude,
				allows_location: true,
			});
			setAllowedLocation(true);
			setMsg({
				type: "success",
				message: "Location updated successfully.",
				key: Date.now(),
			});
		} catch (error) {
			setMsg({
				type: "error",
				message: error.message,
				key: Date.now(),
			});
		}
	};

	if (loading) return <Spinner />;

	return (
		<div className="flex gap-5 items-baseline mt-3 mb-3">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<RegularButton
				value={allowedLocation ? "Update location" : "Share location"}
				type="button"
				icon="fa fa-map-marker"
				callback={onSubmit}
			/>
			<p
				className={`text-sm mt-2 ${
					allowedLocation ? "text-green-600" : "text-gray-500"
				}`}
			>
				{allowedLocation ? (
					<>
						<i className="fa fa-check" /> Location shared
					</>
				) : (
					<>
						<i className="fa fa-times" /> Location not shared
					</>
				)}
			</p>
		</div>
	);
};

export default EditLocation;
