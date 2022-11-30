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
});
