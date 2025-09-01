import { appendStyles, shimCSS } from '../../styled';
import { Component } from '../../Component';
import { GET } from '../../request';

const dependentStyleSheets = [
	'@fortawesome/fontawesome-free/css/all.css',
	'@fontsource-variable/kode-mono/index.css',
	'augmented-ui/augmented-ui.min.css',
];

shimCSS({ styles: ({ page }) => page });

/**
 * Page component that provides full-page layout with automatic stylesheet loading.
 *
 * Serves as a root container for applications with automatic loading of required stylesheets
 * including FontAwesome, fonts, and augmented-ui. Provides full viewport sizing and flexible layout.
 * @param {object} [options={}] - Page configuration options
 * @param {Array<string|object>} [options.styleSheets=[]] - Additional stylesheets to load
 * @param {object} [options.style] - Additional CSS styles to apply
 * @param {string} [options.autoRender='onload'] - When to auto-render the page
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Page} Page component instance
 */
class Page extends Component {
	constructor(options = {}, ...children) {
		const { styleSheets = [], ...optionsWithoutConfig } = options;

		[...dependentStyleSheets, ...styleSheets].forEach(styleSheet => {
			if (!styleSheet) return;

			const { href, scope, id } = typeof styleSheet === 'object' ? styleSheet : { href: styleSheet };

			if (scope) {
				GET(href).then(({ body }) => appendStyles(`${scope} { ${body} }`, id || scope));

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
