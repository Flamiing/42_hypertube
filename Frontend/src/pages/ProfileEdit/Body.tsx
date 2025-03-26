import { useEffect, useState } from "react";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import { EditProfileData } from "../../services/api/profile";
import calculateAge from "../../utils/calculateAge";
import Spinner from "../../components/common/Spinner";
import RegularButton from "../../components/common/RegularButton";

interface BodyProps {
	user: EditProfileData;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Body = ({ user, onChange, onSelectChange }: BodyProps) => {
	return (
		<section className="container max-w-4xl px-3 relative text-font-main pt-5">
			<div className="flex flex-col gap-5 w-full text-start">
				<div>
					<label htmlFor="preferredLanguage">
						Preferred language
					</label>
					<FormSelect
						name="preferredLanguage"
						/* TODO: List all possible languages */
						options={[
							{ value: "english", label: "English" },
							{ value: "spanish", label: "Spanish" },
							{ value: "german", label: "German" },
						]}
						value={user.preferredLanguage || ""}
						onChange={onSelectChange}
					/>
				</div>
			</div>
		</section>
	);
};

export default Body;
