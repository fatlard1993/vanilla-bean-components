const usageRules = require('./eslint/usageRules.cjs');

const levels = level => Object.fromEntries(Object.keys(usageRules.rules).map(id => [`vbc/${id}`, level]));

/**
 * The usage rules a pattern can find (docs/USAGE_RULES.md), as warnings named `vbc/<rule id>`, for an app that opts in.
 * They read an app's client code; server, script and test files and a tool's own dev UI are left alone.
 * @example module.exports = [
 *   ...require('@vanilla-bean/components/eslint.app.config.cjs'),
 *   ...require('@vanilla-bean/components/eslint.usage.config.cjs'),
 * ];
 */
module.exports = [
	{
		files: ['**/*.js', '**/*.mjs'],
		plugins: { vbc: usageRules },
		rules: levels('warn'),
	},
	{
		files: [
			'server/**/*.js',
			'scripts/**/*.js',
			'cli/**/*.js',
			'bin/**/*.js',
			'e2e/**/*.js',
			'test/**/*.js',
			'client/build.js',
			'*.config.js',
		],
		rules: levels('off'),
	},
	{
		// Tests build raw elements to drive what they test, and a tool's own dev UI isn't what the app's users see
		files: ['**/*.test.js', '**/devTools/**', '**/DevTools/**', '**/devtools/**'],
		rules: levels('off'),
	},
];
