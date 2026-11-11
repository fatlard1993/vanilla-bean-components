import { describe, expect, test } from 'bun:test';

import { Component } from './Component';

describe('test-setup', () => {
	test('a node in the page prints as its markup, so a failed assertion on one fails rather than hangs', () => {
		const component = new Component({ addClass: 'printed', onPointerPress: () => {}, appendTo: container });

		expect(Bun.inspect(component.elem)).toStartWith('<div class="');
		expect(Bun.inspect(component.elem)).toContain('printed');
	});

	test('long markup is cut short', () => {
		const component = new Component({ textContent: 'x'.repeat(1000), appendTo: container });

		expect(Bun.inspect(component.elem).length).toBeLessThan(310);
	});
});
