import { defineConfig } from 'vitest/config';

export default defineConfig({
	root: './demo',
	server: {
		port: 9999,
	},
	test: {
		include: ['../**/*.unit.test.js'],
	},
});
