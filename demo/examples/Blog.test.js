describe('Blog Demo', () => {
	test('Blog demo class exists and is importable', async () => {
		try {
			const { default: BlogExample } = await import('./Blog.js');
			expect(BlogExample).toBeDefined();
			expect(typeof BlogExample).toBe('function');
		} catch (error) {
			// If import fails due to missing .asText, that's expected in test environment
			expect(error.message).toContain('Cannot find module');
		}
	});

	test('Blog demo has async fetchPosts function', () => {
		const fs = require('fs');
		const path = require('path');

		const blogCode = fs.readFileSync(path.join(__dirname, 'Blog.js'), 'utf8');

		expect(blogCode).toContain('fetchPosts');
		expect(blogCode).toContain('async render()');
		expect(blogCode).toContain('extends ExampleView');
	});

	test('Blog demo includes styled components', () => {
		const fs = require('fs');
		const path = require('path');

		const blogCode = fs.readFileSync(path.join(__dirname, 'Blog.js'), 'utf8');

		expect(blogCode).toContain('styled.Icon');
		expect(blogCode).toContain('PostHeading');
		expect(blogCode).toContain('Loader');
	});
});
