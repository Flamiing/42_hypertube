/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	// colors
	theme: {
		extend: {
			colors: {
				primary: "#FA8072", // Salmon
				"primary-monochromatic": "#F85441",
				secondary: "#72ECFA",
				"secondary-light": "#5DADE2",
				tertiary: "#9B59B6",
				"font-main": "#414B61",
				"font-secondary": "#A5A5A5",
				"background-main": "#F5F5F5",
				"background-secondary": "#E5E5E5",
				"hover-header": "#f2f4ff",
			},
		},
	},
};
