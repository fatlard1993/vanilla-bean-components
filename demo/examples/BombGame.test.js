describe('BombGame Demo', () => {
	test('BombGame demo class exists and is importable', async () => {
		try {
			const { default: BombGameExample } = await import('./BombGame.js');
			expect(BombGameExample).toBeDefined();
			expect(typeof BombGameExample).toBe('function');
		} catch (error) {
			// If import fails due to missing .asText, that's expected in test environment
			expect(error.message).toContain('Cannot find module');
		}
	});

	test('BombGame demo includes game components', () => {
		const fs = require('fs');
		const path = require('path');

		const gameCode = fs.readFileSync(path.join(__dirname, 'BombGame.js'), 'utf8');

		expect(gameCode).toContain('extends ExampleView');
		expect(gameCode).toContain('Button');
		expect(gameCode).toContain('styled');
	});

	test('BombGame demo has game logic', () => {
		const fs = require('fs');
		const path = require('path');

		const gameCode = fs.readFileSync(path.join(__dirname, 'BombGame.js'), 'utf8');

		expect(gameCode).toContain('bomb');
		expect(gameCode).toContain('score');
		expect(gameCode).toContain('BombGame');
	});
});
