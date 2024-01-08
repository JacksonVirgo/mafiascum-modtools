const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const fs = require('fs');
const path = require('path');
const output = 'dist';
const json = require('./manifest.json');

const entryPoints = {
	main: [path.resolve(__dirname, 'src', 'content', 'index.ts')],
	background: path.resolve(__dirname, 'src', 'background', 'background.ts'),
	styling: path.resolve(__dirname, 'src', 'styles', '_main.scss'),
};

function fillConfig(version) {
	return {
		entry: entryPoints,
		output: {
			path: path.join(__dirname, output, version),
			filename: '[name].js',
		},
		resolve: {
			extensions: ['.ts', '.js'],
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
					use: 'url-loader?limit=1024',
				},
				{
					test: /\.(s[ac]ss|css)$/i,
					use: [
						// 'style-loader', // Injects CSS into the DOM
						MiniCssExtractPlugin.loader,
						'css-loader', // Translates CSS into CommonJS
						'postcss-loader', // Process CSS with PostCSS
						'sass-loader', // Compiles Sass to CSS
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
			{
				apply(compiler) {
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
						const commonFields = json['commonFields'];
						const versionFields = json[version];

						const compiledManifest = {
							...commonFields,
							...versionFields,
						};

						fs.writeFileSync(`./${output}/${version}/manifest.json`, JSON.stringify(compiledManifest, null, 2));
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
