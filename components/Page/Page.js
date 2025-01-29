import { appendStyles, shimCSS } from '../../styled';
import { Component } from '../../Component';
import { GET } from '../../request';

const dependentStyleSheets = [
	'@fortawesome/fontawesome-free/css/all.css',
	'source-code-pro/source-code-pro.css',
	'augmented-ui/augmented-ui.min.css',
];

shimCSS({ styles: ({ page }) => page });

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
