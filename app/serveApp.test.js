import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { ConflictError, ValidationError } from './errors';
import { sameOrigin, serveApp, withErrors } from './serveApp';

describe('serveApp', () => {
	const DomResponse = globalThis.Response;
	let root;

	beforeAll(async () => (globalThis.Response = (await Bun.fetch('data:,')).constructor));
	afterAll(() => (globalThis.Response = DomResponse));

	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), 'serveApp-'));
		mkdirSync(join(root, 'assets'));
		writeFileSync(join(root, 'index.html'), '<html>app</html>');
		writeFileSync(join(root, 'assets/chunk-hashed.js'), 'chunk');
	});

	afterAll(() => rmSync(root, { recursive: true, force: true }));

	const get = (path, options) => serveApp(new Request(`http://localhost${path}`), { root, ...options });

	test('the page is revalidated on every load, at / and at any route the client owns', async () => {
		for (const path of ['/', '/games/12']) {
			const page = await get(path);

			expect(await page.text()).toBe('<html>app</html>');
			expect(page.headers.get('cache-control')).toBe('no-cache');
		}
	});

	test('built files are served as they are', async () => {
		const chunk = await get('/assets/chunk-hashed.js');

		expect(await chunk.text()).toBe('chunk');
		expect(chunk.headers.get('cache-control')).toBeNull();
	});

	test('an unknown api path, or a file that is gone, is left for a 404, never answered with the page', async () => {
		expect(await get('/api/nope')).toBeUndefined();
		expect(await get('/api')).toBeUndefined();
		expect(await get('/chunk-from-last-build.js')).toBeUndefined();
		expect(await (await get('/api/nope', { api: false })).text()).toBe('<html>app</html>');
	});

	test('headers of its own reach the page; writes are left alone', async () => {
		const page = await get('/', { headers: { 'content-security-policy': "frame-ancestors 'none'" } });

		expect(page.headers.get('content-security-policy')).toBe("frame-ancestors 'none'");
		expect(await serveApp(new Request('http://localhost/', { method: 'POST' }), { root })).toBeUndefined();
	});
});

describe('withErrors', () => {
	const DomResponse = globalThis.Response;

	beforeAll(async () => (globalThis.Response = (await Bun.fetch('data:,')).constructor));
	afterAll(() => (globalThis.Response = DomResponse));

	const answer = (error, log = () => {}) =>
		withErrors(
			() => {
				throw error;
			},
			{ log },
		)(new Request('http://localhost/api/games'));

	test('malformed JSON and a ValidationError answer 400 with the reason', async () => {
		expect((await answer(new SyntaxError('Failed to parse JSON'))).status).toBe(400);
		expect((await answer(new SyntaxError("JSON Parse error: Expected '}'"))).status).toBe(400);
		// A SyntaxError of the server's own making is its fault, not the client's
		expect((await answer(new SyntaxError('Invalid regular expression'), () => {})).status).toBe(500);

		const invalid = await answer(new ValidationError('name is required'));

		expect(invalid.status).toBe(400);
		expect(await invalid.json()).toEqual({ error: 'name is required' });
	});

	test('a ConflictError answers 409 with the stored record', async () => {
		const conflict = await answer(new ConflictError({ name: 'Go', _v: 2 }));

		expect(conflict.status).toBe(409);
		expect(await conflict.json()).toMatchObject({ _conflict: true, current: { name: 'Go', _v: 2 } });
	});

	test('anything else is logged and answers 500 without its details', async () => {
		const logged = [];
		const failed = await answer(new Error('secret path /etc/x'), (...args) => logged.push(args));

		expect(failed.status).toBe(500);
		expect(await failed.text()).not.toContain('secret');
		expect(logged[0][1].message).toBe('secret path /etc/x');
	});

	test('a router that answers is passed through', async () => {
		const ok = await withErrors(() => new Response('fine'))(new Request('http://localhost/'));

		expect(await ok.text()).toBe('fine');
	});
});

describe('sameOrigin', () => {
	// The DOM test setup's Request drops Origin and Host, as a browser's would, so these are built by hand
	const request = (method, headers = {}) => ({ method, headers: { get: name => headers[name] ?? null } });

	test('a write or an upgrade from this host passes; from another, or from nowhere ("null"), it does not', () => {
		expect(sameOrigin(request('POST', { origin: 'http://me:8033', host: 'me:8033' }))).toBe(true);
		expect(sameOrigin(request('POST', { origin: 'http://evil.test', host: 'me:8033' }))).toBe(false);
		expect(sameOrigin(request('DELETE', { origin: 'null', host: 'me:8033' }))).toBe(false);
		expect(sameOrigin(request('GET', { origin: 'http://evil.test', host: 'me:8033', upgrade: 'websocket' }))).toBe(
			false,
		);
	});

	test('reads, and requests from outside a browser (no Origin), pass', () => {
		expect(sameOrigin(request('GET', { origin: 'http://evil.test', host: 'me:8033' }))).toBe(true);
		expect(sameOrigin(request('POST', { host: 'me:8033' }))).toBe(true);
	});
});
