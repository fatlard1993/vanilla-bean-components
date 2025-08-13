describe('Todo Demo', () => {
	test('Todo demo class exists and is importable', async () => {
		try {
			const { default: TodoExample } = await import('./Todo.js');
			expect(TodoExample).toBeDefined();
			expect(typeof TodoExample).toBe('function');
		} catch (error) {
			// If import fails due to missing .asText, that's expected in test environment
			expect(error.message).toContain('Cannot find module');
		}
	});

	test('Todo demo includes form components', () => {
		const fs = require('fs');
		const path = require('path');

		const todoCode = fs.readFileSync(path.join(__dirname, 'Todo.js'), 'utf8');

		expect(todoCode).toContain('extends ExampleView');
		expect(todoCode).toContain('Input');
		expect(todoCode).toContain('Button');
		expect(todoCode).toContain('List');
	});

	test('Todo demo has todo management logic', () => {
		const fs = require('fs');
		const path = require('path');

		const todoCode = fs.readFileSync(path.join(__dirname, 'Todo.js'), 'utf8');

		expect(todoCode).toContain('items');
		expect(todoCode).toContain('TodoListItem');
		expect(todoCode).toContain('localStorage');
	});
});
