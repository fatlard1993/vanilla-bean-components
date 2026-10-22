import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { buildClient } from './buildClient';

describe('buildClient', () => {
	let root;

	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), 'buildClient-'));
		writeFileSync(
			join(root, 'index.js'),
			"if (process.env.NODE_ENV === 'development') globalThis.marker = 'development-only';\nglobalThis.always = 'kept';\n",
		);
	});

	afterAll(() => rmSync(root, { recursive: true, force: true }));

	const build = async options => {
		const outdir = join(root, `build-${options.production ? 'production' : 'development'}`);
		const result = await buildClient({ entrypoints: [join(root, 'index.js')], outdir, ...options });

		return { result, code: readFileSync(join(outdir, 'index.js'), 'utf8'), files: readdirSync(outdir) };
	};

	test('a production build drops development-only code and minifies', async () => {
		const { result, code, files } = await build({ production: true });

		expect(result.success).toBe(true);
		expect(code).not.toContain('development-only');
		expect(code).toContain('kept');
		expect(code.trim().split('\n')).toHaveLength(1);
		expect(files).not.toContain('index.js.map');
	});

	test('a development build keeps development-only code and writes a source map', async () => {
		const { code, files } = await build({ production: false });

		expect(code).toContain('development-only');
		expect(files).toContain('index.js.map');
	});

	test("a page's chunks are named from the root, so a deep route finds them; '' makes them relative", async () => {
		writeFileSync(
			join(root, 'index.html'),
			'<!doctype html><html><body><script type="module" src="./index.js"></script>',
		);

		for (const [publicPath, prefix] of [
			[undefined, '/'],
			['', './'],
		]) {
			const outdir = join(root, `build-public-${prefix.length}`);

			await buildClient({ entrypoints: [join(root, 'index.html')], outdir, publicPath });

			expect(readFileSync(join(outdir, 'index.html'), 'utf8')).toMatch(new RegExp(`src="${prefix}chunk-`));
		}
	});

	test('defines are merged over NODE_ENV', async () => {
		writeFileSync(join(root, 'index.js'), 'globalThis.version = VERSION;\n');

		const { code } = await build({ production: true, define: { VERSION: '"1.2.3"' } });

		expect(code).toContain('1.2.3');
	});

	test('the files a manifest names are copied into the build at its paths, since the bundler leaves them as written', async () => {
		const site = join(root, 'site');
		const outdir = join(root, 'build-manifest');

		mkdirSync(join(site, 'icons'), { recursive: true });
		writeFileSync(
			join(site, 'index.html'),
			'<!doctype html><html><head><link rel="manifest" href="./manifest.json" /></head><body></body></html>',
		);
		writeFileSync(
			join(site, 'manifest.json'),
			JSON.stringify({
				icons: [
					{ src: 'icons/icon-192.png' },
					{ src: '/icon.svg' },
					{ src: 'missing.png' },
					{ src: 'https://x.test/a.png' },
				],
				screenshots: [{ src: './wide.png' }],
			}),
		);
		writeFileSync(join(site, 'icons', 'icon-192.png'), 'png');
		writeFileSync(join(site, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
		writeFileSync(join(site, 'wide.png'), 'wide');

		const result = await buildClient({ entrypoints: [join(site, 'index.html')], outdir });

		expect(result.success).toBe(true);
		expect(readFileSync(join(outdir, 'icons', 'icon-192.png'), 'utf8')).toBe('png');
		expect(readFileSync(join(outdir, 'icon.svg'), 'utf8')).toContain('<svg');
		expect(readFileSync(join(outdir, 'wide.png'), 'utf8')).toBe('wide');
		expect(existsSync(join(outdir, 'missing.png'))).toBe(false);
	});
});
