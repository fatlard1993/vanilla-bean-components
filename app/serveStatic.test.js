import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { serveStatic } from './serveStatic';

const get = (path, options) => serveStatic(new Request(`http://localhost${path}`), options);

describe('serveStatic', () => {
	let root;

	// Server code answers with Bun's own Response, which the DOM test setup replaces
	const DomResponse = globalThis.Response;

	beforeAll(async () => (globalThis.Response = (await Bun.fetch('data:,')).constructor));
	afterAll(() => (globalThis.Response = DomResponse));

	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), 'serveStatic-'));
		mkdirSync(join(root, 'build/assets'), { recursive: true });
		writeFileSync(join(root, 'build/index.html'), '<html></html>');
		writeFileSync(join(root, 'build/assets/app.js'), 'app');
		writeFileSync(join(root, 'build/.env'), 'SECRET=1');
		writeFileSync(join(root, 'secret.txt'), 'secret');
	});

	afterAll(() => rmSync(root, { recursive: true, force: true }));

	const options = () => ({ root: join(root, 'build') });

	test('serves built files', async () => {
		expect(await (await get('/assets/app.js', options())).text()).toBe('app');
	});

	test('serves index.html for a directory', async () => {
		expect(await (await get('/', options())).text()).toBe('<html></html>');
	});

	test('serves nothing for a missing file', async () => {
		expect(await get('/missing.js', options())).toBeUndefined();
	});

	test('serves nothing outside the root, however the path is spelled', async () => {
		expect(await get('/../secret.txt', options())).toBeUndefined();
		expect(await get('/%2e%2e/secret.txt', options())).toBeUndefined();
		expect(await get(`/assets/${encodeURIComponent('../../secret.txt')}`, options())).toBeUndefined();
		expect(await get(`/${encodeURIComponent(join(root, 'secret.txt'))}`, options())).toBeUndefined();
	});

	test('serves no dotfiles', async () => {
		expect(await get('/.env', options())).toBeUndefined();
	});

	test('serves nothing for a path that cannot be decoded', async () => {
		expect(await get('/%E0%A4%A', options())).toBeUndefined();
	});

	test('serves only GET and HEAD', async () => {
		expect(await serveStatic(new Request('http://localhost/', { method: 'POST' }), options())).toBeUndefined();
	});

	test('serves the stylesheets Page links, at any depth', async () => {
		const response = await get('/games/12/@fortawesome/fontawesome-free/css/all.css', options());

		expect(response).toBeInstanceOf(Response);
		expect(await response.text()).toContain('Font Awesome');
	});

	test('serves the font the stylesheets point at', async () => {
		expect(
			await get('/@fontsource-variable/kode-mono/files/kode-mono-latin-wght-normal.woff2', options()),
		).toBeInstanceOf(Response);
	});

	test("serves the library's syntax font", async () => {
		expect(await get('/@vanilla-bean/components/FontWithASyntaxHighlighter-Regular.woff2', options())).toBeInstanceOf(
			Response,
		);
	});

	test('serves no dotfiles or nested node_modules from a package', async () => {
		expect(await get('/@vanilla-bean/components/.gitignore', options())).toBeUndefined();
		expect(await get('/@vanilla-bean/components/node_modules/nanoid/package.json', options())).toBeUndefined();
	});

	test('serves no package it was not given', async () => {
		expect(await get('/nanoid/package.json', options())).toBeUndefined();
		expect(await get('/nanoid/package.json', { ...options(), packages: ['nanoid'] })).toBeInstanceOf(Response);
	});
});
