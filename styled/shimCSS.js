import rootContext from '../rootContext';
import { appendStyles } from './appendStyles';

import { postCSS } from './postCSS';
import { themeStyles } from './themeStyles';

/**
 * Complete CSS processing pipeline: theme hydration → PostCSS processing → DOM injection
 * Handles load-time batching for performance optimization
 * @param {import('./themeStyles').StyleConfig} styleConfig - Configuration object with styles function and optional scope
 * @returns {Promise<void>|void} Promise when document loaded, void when queued for load event
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
