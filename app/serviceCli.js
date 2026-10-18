#!/usr/bin/env bun
import { readFileSync } from 'fs';
import path from 'path';

import { SERVICE_COMMANDS, service } from './service';

const usage = `Usage: vbc-service <${SERVICE_COMMANDS.join('|')}> [--name n] [--description d] [--entry server/index.js] [--port p] [-- ...server args]

Runs the app in the current directory as a background service: a systemd user unit on Linux, a launchd agent on macOS.
The name and description default to package.json's (without its scope).`;

const [command, ...rest] = process.argv.slice(2);

if (!SERVICE_COMMANDS.includes(command)) {
	console.error(usage);
	process.exit(1);
}

const flags = {};
const passthrough = [];

for (let index = 0; index < rest.length; index++) {
	if (rest[index] === '--') {
		passthrough.push(...rest.slice(index + 1));
		break;
	}

	const flag = rest[index].match(/^--(name|description|entry|port)(?:=(.*))?$/);

	if (!flag) {
		console.error(`Unknown argument: ${rest[index]}\n\n${usage}`);
		process.exit(1);
	}

	flags[flag[1]] = flag[2] ?? rest[++index];
}

let pkg = {};

try {
	pkg = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
} catch {
	// No package.json: --name is then required, and serviceDefinition says so
}

const code = await service(command, {
	name: flags.name ?? pkg.name?.replace(/^@[^/]+\//, ''),
	description: flags.description ?? pkg.description,
	entry: flags.entry,
	args: [...(flags.port ? ['--port', flags.port] : []), ...passthrough],
});

process.exit(code);
