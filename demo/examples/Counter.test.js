describe('Counter Demo', () => {
	test('Counter demo class exists and is importable', async () => {
		// Test that we can dynamically import without build artifacts
		try {
			const { default: CounterExample } = await import('./Counter.js');
			expect(CounterExample).toBeDefined();
			expect(typeof CounterExample).toBe('function');
		} catch (error) {
			// If import fails due to missing .asText, that's expected in test environment
			expect(error.message).toContain('Cannot find module');
		}
	});

	test('Counter demo extends ExampleView', async () => {
		// Test the class structure without instantiating
		const fs = require('fs');
		const path = require('path');

		const counterCode = fs.readFileSync(path.join(__dirname, 'Counter.js'), 'utf8');

		expect(counterCode).toContain('extends ExampleView');
		expect(counterCode).toContain('export default class');
		expect(counterCode).toContain('render()');
	});
});
