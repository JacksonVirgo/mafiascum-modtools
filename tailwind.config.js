/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.tsx'],
	prefix: 'tw-',
	theme: {
		extend: {
			backgroundColor: {
				'modal-bg': 'rgba(0, 0, 0, 0.3)',
			},
			colors: {
				'primary-color': '#1f1f1f',
				'primary-lighter': '#343434',
				'secondary-color': 'lightgray',
			},
		},
	},
	plugins: [],
};
