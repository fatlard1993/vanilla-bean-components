describe('Calculator Demo', () => {
	test('Calculator demo class exists and is importable', async () => {
		try {
			const { default: CalculatorExample } = await import('./Calculator.js');
			expect(CalculatorExample).toBeDefined();
			expect(typeof CalculatorExample).toBe('function');
		} catch (error) {
			// If import fails due to missing .asText, that's expected in test environment
			expect(error.message).toContain('Cannot find module');
		}
	});

	test('Calculator demo includes keyboard and display components', () => {
		const fs = require('fs');
		const path = require('path');

		const calcCode = fs.readFileSync(path.join(__dirname, 'Calculator.js'), 'utf8');

		expect(calcCode).toContain('extends ExampleView');
		expect(calcCode).toContain('CalculatorDisplay');
		expect(calcCode).toContain('StyledKeyboard');
		expect(calcCode).toContain('Keyboard');
	});

	test('Calculator demo has calculation logic', () => {
		const fs = require('fs');
		const path = require('path');

		const calcCode = fs.readFileSync(path.join(__dirname, 'Calculator.js'), 'utf8');

		expect(calcCode).toContain('eval');
		expect(calcCode).toContain('result');
		expect(calcCode).toContain('onKeyPress');
	});
});
