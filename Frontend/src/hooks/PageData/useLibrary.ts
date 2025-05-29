import { useState } from "react";
import { libraryApi } from "../../services/api/library";

export const useLibrary = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getLibrary = async (page: number, queryParams = {}) => {
		setLoading(true);
		setError(null);
		try {
			const data = await libraryApi.getLibrary(page, queryParams);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Request failed";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return { getLibrary, loading, error };
};
