/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.tsx'],
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {
			backgroundColor: {
				'modal-bg': 'rgba(0, 0, 0, 0.3)',
				'primary-dark': '#151515',
				'secondary-dark': '#2b2b2b',
			},
			colors: {
				'primary-color': '#1f1f1f',
				'primary-lighter': '#343434',
				'primary-lightest': '#4d4d4d',
				'secondary-color': 'lightgray',
				'secondary-lighter': '#d3d3d3',
				'accent-color': '#4a90e2', // A muted blue for accents
				'neutral-light': '#f5f5f5', // Light neutral for contrast
				'warning-color': '#e57f4a', // Warm tone for warnings or alerts
				'success-color': '#7de57f', // Soft green for success
			},
		},
	},
	plugins: [],
};
