import React from "react";
import FormInput from "../../components/common/FormInput";
import RegularButton from "../../components/common/RegularButton";

const Search: React.FC = ({}) => {
	return (
		<form className="flex items-center justify-between w-full max-w-3xl mx-auto my-4 gap-2">
			<FormInput
				type="text"
				placeholder="Search by title, year or language"
				name="search"
				value=""
				onChange={() => {}}
				error=""
			/>
			<RegularButton icon="fa fa-search" callback={() => {}} />
		</form>
	);
};

export default Search;
