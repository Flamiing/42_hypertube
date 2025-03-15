import React, { useState, useEffect } from "react";
import { useEvents } from "../../hooks/PageData/useEvents";
import Spinner from "../../components/common/Spinner";
import EventCard from "./EventCard";
import AddNewEventButton from "./AddNewEventButton";
import MsgCard from "../../components/common/MsgCard";

const Index: React.FC = () => {
	const { getUserEvents, loading, error } = useEvents();
	const [events, setEvents] = useState<any[]>([]);
	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const fetchEvents = async () => {
		try {
			const response = await getUserEvents();
			if (response) {
				setEvents(response);
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "Failed to load events",
				key: Date.now(),
			});
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const handleEventCreated = async () => {
		setMsg({
			type: "success",
			message: "Event created successfully",
			key: Date.now(),
		});
		await fetchEvents();
	};

	const handleEventDeleted = (eventId: string) => {
		setEvents((prevEvents) =>
			prevEvents.filter((event) => event.eventId !== eventId)
		);
	};

	const handleError = (errorMessage: string) => {
		setMsg({
			type: "error",
			message: errorMessage,
			key: Date.now(),
		});
	};

	if (loading) return <Spinner />;
	if (error) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>An error occurred when loading the events</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<section className="container max-w-7xl px-4 flex flex-row justify-between w-full items-center">
				<h1 className="text-4xl font-bold my-10">Events</h1>
				<AddNewEventButton onEventCreated={handleEventCreated} />
			</section>
			<section className="container max-w-7xl my-10 px-4 flex-grow">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
					{events.map((event) => (
						<EventCard
							key={event.eventId}
							event={event}
							onEventDeleted={handleEventDeleted}
							onError={handleError}
						/>
					))}
					{events.length === 0 && (
						<h2 className="col-span-full text-center text-xl font-bold">
							No events scheduled yet!
						</h2>
					)}
				</div>
			</section>
		</main>
	);
};

export default Index;
