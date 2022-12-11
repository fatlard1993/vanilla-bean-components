/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
	define: {
		'process.env': {},
	},
	server: {
		open: '/demo/index.html',
		port: 9999,
	},
	test: {
		include: ['**/*.test.js', 'components/**/test.js'],
		environment: 'jsdom',
		globals: true,
	},
	resolve: {
		alias: {
			path: 'node_modules/@jspm/core/nodelibs/browser/path.js',
			url: 'node_modules/@jspm/core/nodelibs/browser/url.js',
			fs: 'node_modules/@jspm/core/nodelibs/browser/fs.js',
			'source-map-js': 'node_modules/source-map-js/source-map.js',
		},
	},
});
