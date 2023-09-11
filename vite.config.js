/// <reference types="vitest" />

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
	plugins: [
		legacy({
			modernPolyfills: true,
		}),
	],
	server: {
		open: '/demo/index.html',
		port: 9999,
	},
	test: {
		setupFiles: ['vitest-setup.js'],
		include: ['**/*.test.js', 'components/**/test.js'],
		environment: 'jsdom',
		globals: true,
	},
	resolve: {
		alias: {
			process: 'process/browser',
			path: 'node_modules/@jspm/core/nodelibs/browser/path.js',
			url: 'node_modules/@jspm/core/nodelibs/browser/url.js',
			fs: 'node_modules/@jspm/core/nodelibs/browser/fs.js',
			'source-map-js': 'node_modules/source-map-js/source-map.js',
		},
	},
});
