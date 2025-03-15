const getLocationNotAllowed = async () => {
	try {
		navigator.connection.getWiFiList().then((networks) => {
			let location = calculateLocationFromWiFi(networks);
			return {
				latitude: location.latitude,
				longitude: location.longitude,
				allows_location: false,
			};
		});
	} catch (error) {
		try {
			const response = await fetch("https://ipapi.co/json/");
			const data = await response.json();
			return {
				latitude: data.latitude,
				longitude: data.longitude,
				allows_location: false,
			};
		} catch (error) {
			// Default to Madrid, Spain
			return {
				latitude: 40.513305,
				longitude: -3.663652,
				allows_location: false,
			};
		}
	}
};

export default getLocationNotAllowed;
