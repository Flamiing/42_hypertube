import apiRequest from "./config";

export const libraryApi = {
	getLibrary: async (page: int): Promise<any> => {
		const response = await apiRequest(`movies/library/${page}`);
		return response;
	},
};
