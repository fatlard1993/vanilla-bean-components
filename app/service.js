import { mkdir, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

export const SERVICE_COMMANDS = ['enable', 'disable', 'start', 'stop', 'reload', 'status', 'logs'];

const xml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// systemd reads %h and the like as specifiers in every value, so a literal % is doubled
const literal = value => String(value).replace(/%/g, '%%');

// systemd splits ExecStart and Environment on spaces; quoting keeps a value with one in it whole
const quoted = value => {
	const text = literal(value);

	return /[\s"\\]/.test(text) ? `"${text.replace(/(["\\])/g, '\\$1')}"` : text;
};

// ExecStart also expands $NAME, so a literal $ is doubled there
const argument = value => quoted(String(value).replace(/\$/g, '$$$$'));

/**
 * What a background service for an app is on this machine: a systemd user unit on Linux, a launchd agent on macOS.
 * Bun runs the entry from the app's directory, by absolute path since neither manager uses $PATH, and the service
 * restarts when it exits.
 * @param {object} options - Options
 * @param {string} options.name - The service's name, e.g. `home-page`
 * @param {string} [options.description] - One line for the service manager
 * @param {string} [options.cwd] - The app's directory
 * @param {string} [options.entry] - The script Bun runs
 * @param {Array<string>} [options.args] - Arguments after it, e.g. `['--port', '8033']`
 * @param {object} [options.env] - Environment; NODE_ENV defaults to production
 * @param {string} [options.bun] - The Bun to run
 * @param {string} [options.home] - The user's home
 * @param {string} [options.platform] - linux or darwin
 * @returns {{ manager: string, id: string, file: string, contents: string, log?: string }} The definition
 */
export const serviceDefinition = ({
	name,
	description = name,
	cwd = process.cwd(),
	entry = 'server/index.js',
	args = [],
	env = {},
	bun = process.execPath,
	home = os.homedir(),
	platform = process.platform,
}) => {
	if (!/^[\w.-]+$/.test(name ?? '')) throw new Error(`A service name is letters, digits, dots and dashes: "${name}"`);

	const environment = { NODE_ENV: 'production', ...env };
	const command = [bun, entry, ...args];

	// A line break in any value would start a directive of its own in the unit file
	for (const value of [description, cwd, ...command, ...Object.entries(environment).flat()]) {
		// eslint-disable-next-line no-control-regex
		if (/[\u0000-\u001f\u007f]/.test(String(value))) {
			throw new Error(`A service value can't hold control characters: ${JSON.stringify(String(value))}`);
		}
	}

	if (platform === 'darwin') {
		const id = `com.vanilla-bean.${name}`;
		const log = path.join(home, 'Library', 'Logs', `${name}.log`);
		const strings = values => values.map(value => `\t\t<string>${xml(value)}</string>`).join('\n');

		return {
			manager: 'launchd',
			id,
			file: path.join(home, 'Library', 'LaunchAgents', `${id}.plist`),
			log,
			contents: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>${xml(id)}</string>
	<key>ProgramArguments</key>
	<array>
${strings(command)}
	</array>
	<key>WorkingDirectory</key>
	<string>${xml(cwd)}</string>
	<key>EnvironmentVariables</key>
	<dict>
${Object.entries({ HOME: home, ...environment })
	.map(([key, value]) => `\t\t<key>${xml(key)}</key>\n\t\t<string>${xml(value)}</string>`)
	.join('\n')}
	</dict>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
	<key>StandardOutPath</key>
	<string>${xml(log)}</string>
	<key>StandardErrorPath</key>
	<string>${xml(log)}</string>
</dict>
</plist>
`,
		};
	}

	if (platform === 'linux') {
		return {
			manager: 'systemd',
			id: name,
			file: path.join(home, '.config', 'systemd', 'user', `${name}.service`),
			contents: `[Unit]
Description=${literal(description)}
After=network.target

[Service]
Type=simple
WorkingDirectory=${literal(cwd)}
ExecStart=${command.map(argument).join(' ')}
${Object.entries(environment)
	.map(([key, value]) => `Environment=${quoted(`${key}=${value}`)}`)
	.join('\n')}
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
`,
		};
	}

	throw new Error(`No service manager for ${platform}; this runs on linux (systemd) and darwin (launchd)`);
};

const spawn = async argv => {
	const child = Bun.spawn(argv, { stdout: 'inherit', stderr: 'inherit', stdin: 'inherit' });

	return child.exited;
};

/**
 * Install, remove or control an app's background service.
 * - `enable` writes the definition and starts it, now and at every login; run again after a change to update it
 * - `disable` stops it and removes the definition
 * - `start`, `stop`, `reload` (a restart, to pick up a new build), `status`, `logs` (follows them)
 * @example await service('enable', { name: 'home-page', args: ['--port', '8033'] });
 * @param {string} command - One of SERVICE_COMMANDS
 * @param {object} options - As serviceDefinition takes them
 * @param {object} [io] - What it runs and prints through, for tests
 * @param {Function} [io.run] - (argv) => Promise of an exit code; spawns by default
 * @param {Function} [io.log] - (message) => void; console.log by default
 * @returns {Promise<number>} The last exit code: 0 is success
 */
export const service = async (command, options, { run = spawn, log = console.log } = {}) => {
	if (!SERVICE_COMMANDS.includes(command))
		throw new Error(`Unknown command "${command}": ${SERVICE_COMMANDS.join(', ')}`);

	const definition = serviceDefinition(options);
	const { manager, id, file } = definition;
	const systemctl = (...argv) => run(['systemctl', '--user', ...argv]);
	const domain = `gui/${process.getuid?.() ?? 501}`;
	const launchctl = (...argv) => run(['launchctl', ...argv]);

	if (command === 'enable') {
		await mkdir(path.dirname(file), { recursive: true });
		await writeFile(file, definition.contents);
		log(`Wrote ${file}`);

		if (manager === 'systemd') {
			await systemctl('daemon-reload');
			const code = await systemctl('enable', '--now', id);

			// enable --now leaves an already-running service on its old definition
			await systemctl('restart', id);
			log('It starts at login; `loginctl enable-linger` keeps it running without one.');

			return code;
		}

		// bootout first, so enabling again replaces a loaded agent rather than failing on it
		await launchctl('bootout', `${domain}/${id}`);

		return launchctl('bootstrap', domain, file);
	}

	if (command === 'disable') {
		const code =
			manager === 'systemd' ? await systemctl('disable', '--now', id) : await launchctl('bootout', `${domain}/${id}`);

		await rm(file, { force: true });
		if (manager === 'systemd') await systemctl('daemon-reload');
		log(`Removed ${file}`);

		return code;
	}

	if (manager === 'systemd') {
		const verbs = { start: ['start'], stop: ['stop'], reload: ['restart'], status: ['status', '--no-pager'] };

		if (command === 'logs') return run(['journalctl', '--user', '-u', id, '-f']);

		return systemctl(...verbs[command], id);
	}

	const verbs = {
		start: ['kickstart', `${domain}/${id}`],
		stop: ['kill', 'SIGTERM', `${domain}/${id}`],
		// -k ends the running instance before starting a fresh one
		reload: ['kickstart', '-k', `${domain}/${id}`],
		status: ['print', `${domain}/${id}`],
	};

	if (command === 'logs') return run(['tail', '-f', definition.log]);

	return launchctl(...verbs[command]);
};
