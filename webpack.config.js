const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const output = 'dist';
const entryPoints = {
	main: [path.resolve(__dirname, 'src', 'app', 'index.ts'), path.resolve(__dirname, 'src', 'main.css')],
	background: path.resolve(__dirname, 'src', 'background', 'background.ts'),
};

const mv2Config = {
	entry: entryPoints,
	output: {
		path: path.join(__dirname, output, 'v2'),
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
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
				use: 'url-loader?limit=1024',
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: '.', to: '.', context: 'public/globals' },
				{
					from: '.',
					to: './',
					context: 'public/v2',
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
	],
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};

const mv3Config = {
	entry: entryPoints,
	output: {
		path: path.join(__dirname, output, 'v3'),
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
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
				use: 'url-loader?limit=1024',
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: '.', to: '.', context: 'public/globals' },
				{
					from: '.',
					to: './',
					context: 'public/v3',
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
	],
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};

module.exports = [mv2Config, mv3Config];
