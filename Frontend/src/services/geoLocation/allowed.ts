const getLocation = async () => {
	try {
		const position = await new Promise<GeolocationPosition>(
			(resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			}
		);

		return {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			allows_location: true,
		};
	} catch (error) {
		return null;
	}
};

export default getLocation;
