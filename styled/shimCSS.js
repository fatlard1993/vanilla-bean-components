import rootContext from '../rootContext';
import { appendStyles } from './appendStyles';

import { postCSS } from './postCSS';
import { themeStyles } from './themeStyles';

/**
 * Process a css decorator function, hydrating with theme, wrapping in optional scope, and post-processing with postCSS.
 * Then appends the resulting css text a style tag to the page.
 * @param {import('./themeStyles').StyleConfig} styleConfig - The style function and scope to generate the css string
 * @returns {void}
 */
export const shimCSS = styleConfig => {
	if (document.readyState === 'complete') return postCSS(themeStyles(styleConfig)).then(css => appendStyles(css));
	else {
		rootContext.onLoadStyleQueue = rootContext.onLoadStyleQueue || [];
		rootContext.onLoadCSS = rootContext.onLoadCSS || '';

		rootContext.onLoadStyleQueue.push(styleConfig);

		if (!rootContext.onLoadStyleListener) {
			rootContext.onLoadStyleListener = async () => {
				const styleText = rootContext.onLoadStyleQueue.map(themeStyles).join('\n');
				const processedCSS = await postCSS(styleText);

				appendStyles(processedCSS);
			};

			window.addEventListener('load', rootContext.onLoadStyleListener);
		}
	}
};
