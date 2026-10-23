// What the library loads at runtime, shared by the page that asks (Page) and the server that answers (serveStatic)

// Page links these on every app: the icons and the UI font
export const LIBRARY_STYLESHEETS = [
	'@fortawesome/fontawesome-free/css/all.css',
	'@fontsource-variable/kode-mono/index.css',
];

const packageOf = path =>
	path
		.split('/')
		.slice(0, path.startsWith('@') ? 2 : 1)
		.join('/');

// The packages serveStatic answers from: those stylesheets' own, and the library's (the code styles' syntax font)
export const LIBRARY_ASSET_PACKAGES = [...new Set([...LIBRARY_STYLESHEETS.map(packageOf), '@vanilla-bean/components'])];
