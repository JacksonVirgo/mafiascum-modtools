const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');
const output = 'dist';
const json = require('./manifest.json');

// Entry points
const entryPoints = {
	main: [path.resolve(__dirname, 'src', 'content', 'index.ts')],
	background: path.resolve(__dirname, 'src', 'background', 'background.ts'),
	styling: path.resolve(__dirname, 'src', 'styles', 'main.css'),
	popup: path.resolve(__dirname, 'src', 'popup', 'popup.tsx'), // React component
};

// Function to fill configuration for v2 and v3
function fillConfig(version) {
	return {
		entry: entryPoints,
		devtool: 'cheap-module-source-map',
		output: {
			path: path.join(__dirname, output, version),
			filename: '[name].js',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'], // Add .tsx and .jsx extensions
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/, // Handle TypeScript and TSX files
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
					use: 'url-loader?limit=1024',
				},
				{
					test: /\.(css)$/i,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									ident: 'postcss',
									plugins: [tailwindcss, autoprefixer],
								},
							},
						},
					],
				},
			],
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{ from: '.', to: '.', context: 'public' },
					{
						from: '.',
						to: './',
						context: `public`,
					},
				],
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			new HtmlPlugin({
				title: 'Mafia Engine',
				filename: 'popup.html',
				chunks: ['popup'], // Include React popup
			}),
			{
				apply(compiler) {
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
						const commonFields = json['commonFields'];
						const versionFields = json[version];

						const compiledManifest = {
							...commonFields,
							...versionFields,
						};

						fs.writeFileSync(
							`./${output}/${version}/manifest.json`,
							JSON.stringify(compiledManifest, null, 2),
						);
					});
				},
			},
		],
		performance: {
			hints: false,
			maxEntrypointSize: 512000,
			maxAssetSize: 512000,
		},
	};
}

module.exports = [fillConfig('v2'), fillConfig('v3')];
