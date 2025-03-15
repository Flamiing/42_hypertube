import { useState, useEffect } from "react";
import { tagsApi, TagData } from "../../services/api/tags";

export const useTags = () => {

	const [tags, setTags] = useState<TagData[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTags = async () => {
			try {
				setLoading(true);
				const data = await tagsApi.getUserTags();
				setTags(data.msg);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch tags"
				);
				setTags(null);
			} finally {
				setLoading(false);
			}
		};

		fetchTags();
	}, []);

	return { tags, loading, error };
};
