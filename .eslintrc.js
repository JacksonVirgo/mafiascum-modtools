module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'boundaries'],
	settings: {
		'boundaries/include': ['src/**/*'],
		'boundaries/elements': [
			{
				mode: 'full',
				type: 'shared',
				pattern: [
					'src/components/**/*',
					'src/lib/**/*',
					'src/types/**/*',
					'src/builders/**/*',
				],
			},
			{
				mode: 'full',
				type: 'feature',
				capture: ['featureName'],
				pattern: ['src/features/**/*'],
			},
			{
				mode: 'full',
				type: 'app',
				capture: ['_', 'fileName'],
				pattern: ['src/app/**/*'],
			},
		],
	},
	rules: {
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1,
			},
		],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'boundaries/no-unknown': ['error'],
		'boundaries/no-unknown-files': ['error'],
		'boundaries/element-types': [
			'error',
			{
				default: 'disallow',
				rules: [
					{
						from: ['shared'],
						allow: ['shared'],
					},
					{
						from: ['feature'],
						allow: [
							'shared',
							['feature', { featureName: '${from.featureName}' }],
						],
					},
					{
						from: ['app'],
						allow: [
							'shared',
							'feature',
							['app', { fileName: '*.css' }],
						],
					},
				],
			},
		],
	},
};
