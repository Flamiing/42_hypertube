import { useEffect, useState } from "react";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import { EditProfileData } from "../../services/api/profile";
import { useTags } from "../../hooks/PageData/useTags";
import calculateAge from "../../utils/calculateAge";
import Spinner from "../../components/common/Spinner";
import Tag from "../../components/common/Tag";
import TagSection from "../../components/common/TagSection";
import RegularButton from "../../components/common/RegularButton";

interface BodyProps {
	user: EditProfileData;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Body = ({ user, onChange, onSelectChange }: BodyProps) => {
	const { tags, loading, error } = useTags();

	const handleTagsChange = (newTagIds: string[]) => {
		const syntheticEvent = {
			target: {
				name: "tags",
				value: newTagIds.map((tagId) => {
					const tagObject = tags?.find((tag) => tag.id === tagId);
					return tagObject || { id: tagId, value: "" };
				}),
			},
		} as React.ChangeEvent<HTMLInputElement>;
		onChange(syntheticEvent);
	};

	const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let timestamp: number | null = 0;
		if (e.target.value) {
			const date = new Date(e.target.value);
			date.setHours(12, 0, 0, 0);
			timestamp = date.getTime();
		}

		const syntheticEvent = {
			target: {
				name: "age",
				value: timestamp,
			},
		} as React.ChangeEvent<HTMLInputElement>;
		onChange(syntheticEvent);
	};

	const dateFormatConversion = (timestamp: string) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const formattedDate = date.toISOString().split("T")[0];
		return formattedDate;
	};

	return (
		<section className="container max-w-4xl px-3 relative text-font-main pt-5">
			<div className="flex flex-col gap-5 w-full text-start">
				<div>
					<label htmlFor="birthday">Birthday</label>
					<input
						id="birthday"
						type="date"
						name="birthday"
						value={dateFormatConversion(user.age)}
						onChange={handleBirthdayChange}
						className="rounded-md w-full p-3 my-1 border border-gray-300"
						max={
							new Date(
								new Date().setFullYear(
									new Date().getFullYear() - 18
								)
							)
								.toISOString()
								.split("T")[0]
						}
					/>
					{user.age != 0 && (
						<p className="text-sm text-gray-600 mt-1">
							Age: {calculateAge(user.age)} years old
						</p>
					)}
				</div>
				<div>
					<label htmlFor="gender">Your Gender</label>
					<FormSelect
						name="gender"
						options={[
							{ value: "male", label: "Male" },
							{ value: "female", label: "Female" },
						]}
						value={user.gender || ""}
						onChange={onSelectChange}
					/>
				</div>
				<div>
					<label htmlFor="sexual_preference">
						Your Sexual Preference
					</label>
					<FormSelect
						name="sexual_preference"
						options={[
							{ value: "male", label: "Male" },
							{ value: "female", label: "Female" },
							{ value: "bisexual", label: "Bisexual" },
						]}
						value={user.sexual_preference || ""}
						onChange={onSelectChange}
					/>
				</div>
				<div>
					<p>Tags</p>
					<TagSection
						availableTags={tags || []}
						selectedTagIds={user.tags?.map((tag) => tag.id) || []}
						onTagsChange={handleTagsChange}
						isLoading={loading}
					/>
				</div>
			</div>
		</section>
	);
};

export default Body;
