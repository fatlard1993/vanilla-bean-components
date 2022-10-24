module.exports = {
	env: {
		browser: true,
		es2022: true,
		node: true,
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:cypress/recommended'],
	rules: {
		'no-async-promise-executor': 'off',
		'no-prototype-builtins': 'off',
	},
};
