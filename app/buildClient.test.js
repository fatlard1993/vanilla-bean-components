import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
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

	test('defines are merged over NODE_ENV', async () => {
		writeFileSync(join(root, 'index.js'), 'globalThis.version = VERSION;\n');

		const { code } = await build({ production: true, define: { VERSION: '"1.2.3"' } });

		expect(code).toContain('1.2.3');
	});
});
