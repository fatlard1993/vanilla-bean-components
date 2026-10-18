import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { service, serviceDefinition } from './service';

describe('serviceDefinition', () => {
	const options = {
		name: 'home-page',
		description: 'Home Page',
		cwd: '/apps/home page',
		bun: '/opt/bun',
		home: '/home/me',
	};

	test('linux: a systemd user unit that runs the entry from the app directory and restarts it', () => {
		const { manager, id, file, contents } = serviceDefinition({
			...options,
			platform: 'linux',
			args: ['--port', '8033'],
		});

		expect(manager).toBe('systemd');
		expect(id).toBe('home-page');
		expect(file).toBe('/home/me/.config/systemd/user/home-page.service');
		expect(contents).toContain('WorkingDirectory=/apps/home page');
		expect(contents).toContain('ExecStart=/opt/bun server/index.js --port 8033');
		expect(contents).toContain('Environment=NODE_ENV=production');
		expect(contents).toContain('Restart=always');
	});

	test('darwin: a launchd agent, kept alive, logging to a file', () => {
		const { manager, file, log, contents } = serviceDefinition({ ...options, platform: 'darwin', env: { A: 'x&y' } });

		expect(manager).toBe('launchd');
		expect(file).toBe('/home/me/Library/LaunchAgents/com.vanilla-bean.home-page.plist');
		expect(log).toBe('/home/me/Library/Logs/home-page.log');
		expect(contents).toContain('<string>/opt/bun</string>');
		expect(contents).toContain('<string>x&amp;y</string>');
		expect(contents).toContain('<key>KeepAlive</key>');
	});

	test('linux: % and $ stay literal, and a line break that would start a directive is refused', () => {
		const { contents } = serviceDefinition({
			...options,
			platform: 'linux',
			description: '100% home',
			args: ['--greeting', '$HOME at %h'],
			env: { PRICE: '$5 or 5%' },
		});

		expect(contents).toContain('Description=100%% home');
		expect(contents).toContain('"$$HOME at %%h"');
		expect(contents).toContain('Environment="PRICE=$5 or 5%%"');

		for (const bad of [
			{ description: 'Home\nExecStartPre=/bin/evil' },
			{ args: ['--port', '1\rExecStartPre=/bin/evil'] },
			{ env: { A: 'x\nExecStartPre=/bin/evil' } },
			{ cwd: '/apps\nExecStartPre=/bin/evil' },
		]) {
			expect(() => serviceDefinition({ ...options, platform: 'linux', ...bad })).toThrow('control characters');
		}
	});

	test('a name that could escape its file is refused, and so is an unknown platform', () => {
		expect(() => serviceDefinition({ ...options, name: '../evil', platform: 'linux' })).toThrow();
		expect(() => serviceDefinition({ ...options, platform: 'win32' })).toThrow('No service manager');
	});
});

describe('service', () => {
	let home;

	beforeEach(() => (home = mkdtempSync(join(tmpdir(), 'service-'))));
	afterEach(() => rmSync(home, { recursive: true, force: true }));

	const record = () => {
		const calls = [];

		return { calls, io: { run: async argv => (calls.push(argv.join(' ')), 0), log: () => {} } };
	};

	const options = () => ({ name: 'game-night', home, bun: '/opt/bun', cwd: '/apps/game-night', platform: 'linux' });

	test('enable writes the unit, then enables, starts and restarts it so a changed unit takes effect', async () => {
		const { calls, io } = record();

		expect(await service('enable', options(), io)).toBe(0);
		expect(readFileSync(join(home, '.config/systemd/user/game-night.service'), 'utf8')).toContain('ExecStart=/opt/bun');
		expect(calls).toEqual([
			'systemctl --user daemon-reload',
			'systemctl --user enable --now game-night',
			'systemctl --user restart game-night',
		]);
	});

	test('disable stops it and removes the unit; the others pass to systemctl', async () => {
		const { calls, io } = record();

		await service('enable', options(), io);
		calls.length = 0;
		await service('reload', options(), io);
		await service('disable', options(), io);

		expect(existsSync(join(home, '.config/systemd/user/game-night.service'))).toBe(false);
		expect(calls).toEqual([
			'systemctl --user restart game-night',
			'systemctl --user disable --now game-night',
			'systemctl --user daemon-reload',
		]);
	});

	test('an unknown command is refused before anything runs', async () => {
		const { calls, io } = record();

		await expect(service('explode', options(), io)).rejects.toThrow('Unknown command');
		expect(calls).toEqual([]);
	});
});
