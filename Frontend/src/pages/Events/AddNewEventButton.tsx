import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import RegularButton from "../../components/common/RegularButton";
import MsgCard from "../../components/common/MsgCard";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import { useUsers } from "../../hooks/PageData/useUsers";
import { useEvents } from "../../hooks/PageData/useEvents";
import UserBubbles from "./UserBubbles";

const AddNewEventButton: React.FC = ({ onEventCreated }) => {
	const { getMatches, loading, error } = useUsers();
	const { createEvent } = useEvents();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [matches, setMatches] = useState<any[]>([]);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		date: "",
		selectedMatch: null,
	});

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	useEffect(() => {
		if (matches.length < 1) {
			getMatches()
				.then((response) => {
					setMatches(response);
				})
				.catch((err) => {
					setMsg({
						type: "error",
						message: err.message,
						key: Date.now(),
					});
				});
		}
	}, []);

	const onChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedUserId = e.target.value;
		const selectedMatch =
			matches.find((match) => match.userId === selectedUserId) || null;

		setFormData((prev) => ({
			...prev,
			selectedMatch,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.selectedMatch) {
			setMsg({
				type: "error",
				message: "Please select a user to invite",
				key: Date.now(),
			});
			return;
		}

		const eventData = {
			invitedUserId: formData.selectedMatch.userId,
			matchId: formData.selectedMatch.matchId,
			title: formData.title,
			description: formData.description,
			date: formData.date.replace("T", " ") + ":00",
		};

		try {
			const response = await createEvent(eventData);
			onEventCreated();
			setIsModalOpen(false);
			setFormData({
				title: "",
				description: "",
				date: "",
				selectedMatch: null,
			});
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message || "Failed to create event, please try again",
				key: Date.now(),
			});
		}
	};

	return (
		<>
			{/* Modal */}
			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				>
					{msg && (
						<MsgCard
							key={msg.key}
							type={msg.type}
							message={msg.message}
							onClose={() => setMsg(null)}
						/>
					)}
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b">
						<h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
							Schedule a new event
						</h3>
						<button
							onClick={() => setIsModalOpen(false)}
							className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<span className="fa fa-close" />
						</button>
					</div>
					{/* Content */}
					<div className="p-4 md:p-6">
						<form
							className="flex flex-col gap-4 md:gap-6 md:mx-5"
							onSubmit={handleSubmit}
						>
							<div className="flex flex-col gap-2">
								<label htmlFor="title">Title</label>
								<FormInput
									name="title"
									value={formData.title}
									onChange={onChange}
									placeholder="Make it something memorable"
									type="text"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="description">Description</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={onChange}
									className="rounded-md w-full p-3 my-1 border border-gray-300"
									placeholder="What's the event about?"
									rows={4}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="date">
									Date and time of event
								</label>
								<input
									type="datetime-local"
									name="date"
									value={formData.date}
									onChange={onChange}
									className="rounded-md w-full p-3 my-1 border border-gray-300"
									min={new Date().toISOString().slice(0, 16)}
								/>
							</div>
							{matches.length > 0 ? (
								<div className="flex flex-col gap-2">
									<label htmlFor="selectedMatch">
										Invite a user
									</label>
									<FormSelect
										name="selectedMatch"
										options={matches.map((match) => ({
											value: match.userId,
											label: match.username,
										}))}
										value={
											formData.selectedMatch?.userId || ""
										}
										onChange={handleSelectChange}
										defaultOption="Select a user to invite"
									/>
									<div className="mt-2 h-14 w-14">
										{formData.selectedMatch && (
											<UserBubbles
												user={formData.selectedMatch}
											/>
										)}
									</div>
								</div>
							) : (
								<p className="text-red-500 font-bold">
									{" "}
									<i className="fa fa-warning mr-2" />
									Please match with some users before creating
									events
								</p>
							)}
							<RegularButton
								value="Create new event"
								disabled={loading}
							/>
						</form>
					</div>
				</Modal>
			)}
			<RegularButton
				value="Add new event"
				icon="fa fa-plus"
				type="button"
				callback={() => setIsModalOpen(true)}
			/>
		</>
	);
};

export default AddNewEventButton;
