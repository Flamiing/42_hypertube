import React, { useState } from "react";
import FormInput from "../../components/common/FormInput";
import RegularButton from "../../components/common/RegularButton";
import { ChevronDown } from "lucide-react";
import TagSection from "../../components/common/TagSection";
import { useTags } from "../../hooks/PageData/useTags";

const FilterSection = ({ onFilterChange }) => {
	const { tags, loading: tagsLoading } = useTags();
	const [formData, setFormData] = useState({
		"max-age": "",
		"min-age": "",
		"max-distance": "",
		"min-fame": "",
		tags: [],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		// if is not number don't update
		if (isNaN(value) || value.indexOf(" ") > -1) return;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleTagsChange = (selectedTagIds) => {
		setFormData((prev) => ({
			...prev,
			tags: selectedTagIds,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Convert string values to numbers where appropriate, empty strings become null
		const processedData = {
			maxAge:
				formData["max-age"] !== ""
					? parseInt(formData["max-age"])
					: null,
			minAge:
				formData["min-age"] !== ""
					? parseInt(formData["min-age"])
					: null,
			maxDistance:
				formData["max-distance"] !== ""
					? parseInt(formData["max-distance"])
					: null,
			minFame:
				formData["min-fame"] !== ""
					? parseInt(formData["min-fame"])
					: null,
			tags: formData.tags,
		};

		onFilterChange(processedData);
	};

	return (
		<div className="w-full">
			<details className="group w-full">
				<summary className="flex items-center justify-between w-full px-4 py-3 cursor-pointer list-none bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
					<div className="flex items-center gap-2">
						<i className="fa fa-filter text-tertiary" />
						<span className="font-medium text-gray-700">
							Filters
						</span>
					</div>
					<i className="fa fa-chevron-down w-5 h-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
				</summary>

				<div className="mt-4 bg-white rounded-lg shadow-md p-6 border border-gray-100">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
									<i className="fa fa-calendar w-4 h-4 text-tertiary" />
									Maximum age
								</label>
								<FormInput
									name="max-age"
									value={formData["max-age"]}
									onChange={handleChange}
									placeholder="Max age"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
									<i className="fa fa-calendar w-4 h-4 text-tertiary" />
									Minimum Age
								</label>
								<FormInput
									name="min-age"
									value={formData["min-age"]}
									onChange={handleChange}
									placeholder="Min age"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
									<i className="fa fa-map-pin w-4 h-4 text-tertiary" />
									Max distance
								</label>
								<FormInput
									name="max-distance"
									value={formData["max-distance"]}
									onChange={handleChange}
									placeholder="Max distance in km"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
									<i className="fa fa-fire w-4 h-4 text-tertiary" />
									Minimum Fame
								</label>
								<FormInput
									name="min-fame"
									value={formData["min-fame"]}
									onChange={handleChange}
									placeholder="Min fame rating"
								/>
							</div>
						</div>

						{/* Tags Section */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
								<i className="fa fa-tags w-4 h-4 text-tertiary" />
								Filter by Tags
							</label>
							<TagSection
								availableTags={tags || []}
								selectedTagIds={formData.tags}
								onTagsChange={handleTagsChange}
								isLoading={tagsLoading}
							/>
						</div>

						{/* Filter button */}
						<div className="flex justify-center md:justify-end pt-4">
							<RegularButton
								value="Apply Filters"
								icon="fa fa-search"
								className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors duration-300 shadow-sm hover:shadow-md"
							/>
						</div>
					</form>
				</div>
			</details>
		</div>
	);
};

export default FilterSection;
