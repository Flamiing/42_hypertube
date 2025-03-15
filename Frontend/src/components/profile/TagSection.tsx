import Tag from "../common/Tag";
import capitalizeLetters from "../../utils/capitalizeLetters";

interface TagsSectionProps {
	tags: string[];
	onRemoveTag?: (tag: string) => void;
	editable?: boolean;
}

const TagsSection = ({
	tags,
	onRemoveTag,
	editable = false,
}: TagsSectionProps) => {
	return (
		<div className="w-full max-w-4xl mx-auto py-6">
			<div className="bg-white rounded-lg p-6 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-gray-900">
						Interests & Hobbies
					</h3>
					{editable && (
						<button
							className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
							aria-label="Edit tags"
						>
							Edit
						</button>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					{tags.length > 0 ? (
						tags.map((tag) => (
							<Tag
								key={tag.id}
								value={capitalizeLetters(tag.value)}
								removable={editable}
							/>
						))
					) : (
						<p className="text-gray-500 text-sm">
							No interests added yet
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default TagsSection;
