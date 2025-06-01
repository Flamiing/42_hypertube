import React from "react";
import FormInput from "../../components/common/FormInput";
import RegularButton from "../../components/common/RegularButton";
import FormSelect from "../../components/common/FormSelect";

interface SearchProps {
	searchType: string;
	searchValue: string;
	searchTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	searchValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSearchSubmit: (e?: React.FormEvent) => void;
}

const Search: React.FC<SearchProps> = ({
	searchType,
	searchValue,
	searchTypeChange,
	searchValueChange,
	onSearchSubmit,
}) => {
	const getPlaceholderText = () => {
		switch (searchType) {
			case "title":
				return "Search by movie title...";
			case "year":
				return "Search by year (e.g., 1961)...";
			case "language":
				return "Search by language (e.g., English)...";
			case "genres":
				return "Search by genres (e.g., drama, romance)...";
			default:
				return "Search...";
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearchSubmit(e);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			onSearchSubmit();
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center justify-between w-full max-w-3xl mx-auto my-4 gap-2"
		>
			<div className="flex">
				<FormSelect
					name="search-type"
					options={[
						{ value: "title", label: "Title" },
						{ value: "year", label: "Year" },
						{ value: "language", label: "Language" },
						{ value: "genres", label: "Genres" },
					]}
					value={searchType}
					onChange={searchTypeChange}
				/>
			</div>
			<FormInput
				type="text"
				placeholder={getPlaceholderText()}
				name="search"
				value={searchValue}
				onChange={searchValueChange}
				onKeyPress={handleKeyPress}
				error=""
			/>
			<RegularButton
				icon="fa fa-search"
				callback={onSearchSubmit}
				type="submit"
			/>
		</form>
	);
};

export default Search;
