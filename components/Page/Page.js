import { appendStyles, shimCSS } from '../../styled';
import { Component } from '../../Component';
import { LIBRARY_STYLESHEETS } from '../../app/libraryAssets';

const ELEMENT_STYLES_ID = 'vbc-theme-elements';

shimCSS({ styles: ({ page }) => page });
shimCSS({ styles: ({ elements }) => elements, id: ELEMENT_STYLES_ID });

// The element styles may not be in the document yet: they are added once the page has loaded
const useElementStyles = enabled => {
	const style = document.getElementById(ELEMENT_STYLES_ID);

	if (style) style.disabled = !enabled;
	else window.addEventListener('load', () => useElementStyles(enabled), { once: true });
};

// Each stylesheet once: a link already in the head, or a scoped sheet already added, is left as it is
const loadStyleSheet = styleSheet => {
	if (!styleSheet) return;

	const { href, scope, id } = typeof styleSheet === 'object' ? styleSheet : { href: styleSheet };

	if (scope) {
		if (document.getElementById(id || scope)) return;

		fetch(href)
			.then(response => response.text())
			.then(css => appendStyles(`${scope} { ${css} }`, id || scope));

		return;
	}

	if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;

	document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
};

/**
 * Page component that provides full-page layout with automatic stylesheet loading.
 *
 * Serves as a root container for applications with automatic loading of required stylesheets
 * including FontAwesome and fonts. Provides full viewport sizing and flexible layout.
 * @param {object} [options={}] - Page configuration options
 * @param {Array<string|object>} [options.styleSheets=[]] - Additional stylesheets to load: an href, or
 *   { href, scope, id } to fetch one and scope its rules under a selector
 * @param {boolean} [options.themeElements=true] - false leaves bare elements (headings, links, form fields) to the app
 * @param {object} [options.style] - Additional CSS styles to apply, over the full-page layout
 * @param {string} [options.autoRender='onload'] - When to auto-render the page; once the window has loaded by default
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Page} Page component instance
 */
class Page extends Component {
	static schema = {
		autoRender: { default: 'onload' },
		// Loaded, with the library's own, when the page is built
		styleSheets: {
			data: true,
			get default() {
				return [];
			},
		},
		// false leaves bare elements (headings, links, code, form fields, buttons, tables) to the app; the library's
		// components keep their look either way
		themeElements: {
			default: true,
			set(value) {
				useElementStyles(value !== false);
			},
		},
	};

	static prepareOptions(options) {
		return {
			...options,
			style: {
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				...options.style,
			},
		};
	}

	build() {
		[...LIBRARY_STYLESHEETS, ...(this.options.styleSheets ?? [])].forEach(loadStyleSheet);
	}
}

export default Page;
