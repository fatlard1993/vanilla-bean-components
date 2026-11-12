import { describe, expect, test } from 'bun:test';

import appConfig from '../eslint.app.config.cjs';
import usageConfig from '../eslint.usage.config.cjs';
import pkg from '../package.json';
import plugin from './usageRules.cjs';

const ruleIds = Object.keys(plugin.rules).map(id => `vbc/${id}`);
const levelsIn = config =>
	config.flatMap(entry => Object.entries(entry.rules ?? {}).filter(([id]) => id.startsWith('vbc/')));

describe('the usage rules are opt-in', () => {
	test('the app config carries none of them', () => {
		expect(appConfig.some(entry => entry.plugins?.vbc)).toBe(false);
		expect(levelsIn(appConfig)).toEqual([]);
	});

	test('the usage config warns every rule in an app source file, and turns them off where they do not apply', () => {
		const [on, ...off] = usageConfig;

		expect(on.plugins.vbc).toBe(plugin);
		expect(Object.keys(on.rules).sort()).toEqual([...ruleIds].sort());
		expect(Object.values(on.rules).every(level => level === 'warn')).toBe(true);

		const offFiles = off.flatMap(entry => entry.files);

		for (const files of ['server/**/*.js', '**/*.test.js', '**/devTools/**']) expect(offFiles).toContain(files);
		for (const entry of off) expect(Object.values(entry.rules).every(level => level === 'off')).toBe(true);
	});

	test('an app can require it from the package', () => {
		expect(pkg.exports['./eslint.usage.config.cjs']).toBe('./eslint.usage.config.cjs');
		expect(pkg.files).toContain('eslint.usage.config.cjs');
	});
});
