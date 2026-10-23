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

/**
 * Page component that provides full-page layout with automatic stylesheet loading.
 *
 * Serves as a root container for applications with automatic loading of required stylesheets
 * including FontAwesome and fonts. Provides full viewport sizing and flexible layout.
 * @param {object} [options={}] - Page configuration options
 * @param {Array<string|object>} [options.styleSheets=[]] - Additional stylesheets to load
 * @param {object} [options.style] - Additional CSS styles to apply
 * @param {string} [options.autoRender='onload'] - When to auto-render the page
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Page} Page component instance
 */
class Page extends Component {
	static schema = {
		// false leaves bare elements (headings, links, code, form fields, buttons, tables) to the app; the library's
		// components keep their look either way
		themeElements: {
			default: true,
			set(value) {
				useElementStyles(value !== false);
			},
		},
	};

	constructor(options = {}, ...children) {
		const { styleSheets = [], ...optionsWithoutConfig } = options;

		[...LIBRARY_STYLESHEETS, ...styleSheets].forEach(styleSheet => {
			if (!styleSheet) return;

			const { href, scope, id } = typeof styleSheet === 'object' ? styleSheet : { href: styleSheet };

			if (scope) {
				fetch(href)
					.then(r => r.text())
					.then(css => appendStyles(`${scope} { ${css} }`, id || scope));

				return;
			}

			const existingLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

			if (existingLink) return;

			const newLink = document.createElement('link');

			newLink.rel = 'stylesheet';
			newLink.href = href;

			document.head.append(newLink);
		});

		super(
			{
				...optionsWithoutConfig,
				style: {
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					...options.style,
				},
				autoRender: 'onload',
			},
			...children,
		);
	}
}

export default Page;
