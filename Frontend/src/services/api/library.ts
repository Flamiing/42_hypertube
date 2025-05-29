import apiRequest from "./config";

export const libraryApi = {
	getLibrary: async (page: number): Promise<any> => {
		const response = await apiRequest(`movies/library/${page}`);
		return response;
	},

	searchLibrary: async (page: number, params = {}): Promise<any> => {
		const response = await apiRequest(
			`movies/search/${page}${params}`
		);
		return response;
	},

	getGenres: async (): Promise<string[]> => {
		const response = await apiRequest("movies/genres");
		return response.msg;
	},
};
