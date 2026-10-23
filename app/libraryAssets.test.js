import { LIBRARY_ASSET_PACKAGES, LIBRARY_STYLESHEETS } from './libraryAssets';

describe('libraryAssets', () => {
	test('every stylesheet Page links comes from a package the server answers from', () => {
		for (const href of LIBRARY_STYLESHEETS) {
			expect(LIBRARY_ASSET_PACKAGES.some(name => href.startsWith(`${name}/`))).toBe(true);
		}
	});

	test('the library serves its own files too', () => {
		expect(LIBRARY_ASSET_PACKAGES).toEqual([
			'@fortawesome/fontawesome-free',
			'@fontsource-variable/kode-mono',
			'@vanilla-bean/components',
		]);
	});
});
