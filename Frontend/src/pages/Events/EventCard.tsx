import React, { useState } from "react";
import UserBubbles from "./UserBubbles";
import { useEvents } from "../../hooks/PageData/useEvents";

const EventCard: React.FC = ({ event, onEventDeleted, onError }) => {
	const { deleteEvent } = useEvents();
	const [isDeleting, setIsDeleting] = useState(false);

	const dateFormat = {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	};

	const hourFormat = {
		hour: "2-digit",
		minute: "2-digit",
	};

	const eventDate = new Date(event.date);

	const handleDelete = async () => {
		if (isDeleting) return;

		setIsDeleting(true);
		try {
			const response = await deleteEvent(event.eventId);
			if (response) onEventDeleted(event.eventId);
		} catch (error) {
			onError(
				error instanceof Error
					? error.message
					: "Failed to delete event"
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="relative group flex flex-col justify-start gap-5 border-4 border-solid border-secondary rounded-lg shadow-lg">
			<button
				type="button"
				onClick={handleDelete}
				disabled={isDeleting}
				className="absolute top-2 right-2 bg-red-500 text-white h-7 w-7 rounded-full xl:opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
				title="Delete event"
			>
				<i className="fa fa-trash" />
			</button>
			<div className="p-6 bg-secondary">
				<h3 className="text-2xl font-bold text-font-main mb-2 break-words">
					{event.title}
				</h3>
				<div className="flex items-center gap-2 text-font-main font-thin">
					<i className="fa fa-calendar"></i>
					<span className="text-sm">
						{eventDate.toLocaleDateString("en-GB", dateFormat)}
					</span>
					<i className="ml-4 fa fa-clock-o" />
					<span className="text-sm">
						{eventDate.toLocaleTimeString("en-GB", hourFormat)}
					</span>
				</div>
			</div>
			<div className="px-6 pb-6 flex justify-start flex-col h-full">
				<p className="text-gray-600 text-base mb-6 break-words">
					{event.description}
				</p>
				<div className="flex gap-4 items-center mt-auto">
					<UserBubbles user={event.attendeeOneInfo} />
					<UserBubbles user={event.attendeeTwoInfo} />
				</div>
			</div>
		</div>
	);
};

export default EventCard;
