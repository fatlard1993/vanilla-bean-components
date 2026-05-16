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
	if (document.readyState === 'complete')
		return postCSS(themeStyles(styleConfig)).then(css => appendStyles(css, styleConfig.scope?.replace(/^\./, '')));
	else {
		rootContext.onLoadStyleQueue = rootContext.onLoadStyleQueue || [];
		rootContext.onLoadStyleQueue.push(styleConfig);

		if (!rootContext.onLoadStyleListener) {
			rootContext.onLoadStyleListener = async () => {
				await Promise.all(
					rootContext.onLoadStyleQueue.map(async config => {
						try {
							const css = await postCSS(themeStyles(config));
							appendStyles(css, config.scope?.replace(/^\./, ''));
						} catch (error) {
							console.error('shimCSS: failed to process style config', error);
						}
					}),
				);

				rootContext.onLoadStyleQueue = null;
				window.removeEventListener('load', rootContext.onLoadStyleListener);
				rootContext.onLoadStyleListener = null;
			};

			window.addEventListener('load', rootContext.onLoadStyleListener);
		}
	}
};
