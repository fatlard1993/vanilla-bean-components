import { defineConfig } from 'cypress';

export default defineConfig({
	fixturesFolder: false,
	video: false,

	component: {
		specPattern: 'components/**/*.test.js',
		devServer: {
			bundler: 'vite',
		},
	},
});
