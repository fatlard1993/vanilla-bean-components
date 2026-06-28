import { appendStyles } from './appendStyles';
import { themeStyles } from './themeStyles';

let loadQueue = null;
let loadListener = null;

/**
 * CSS pipeline: theme hydration → DOM injection.
 * Batches configs queued before document load and flushes them on window load.
 * @param {import('./themeStyles').StyleConfig} styleConfig - Configuration object with styles function and optional scope
 */
export const shimCSS = styleConfig => {
	if (document.readyState === 'complete') {
		appendStyles(themeStyles(styleConfig) || '', styleConfig.scope?.replace(/^\./, ''));
	} else {
		loadQueue = loadQueue || [];
		loadQueue.push(styleConfig);

		if (!loadListener) {
			loadListener = () => {
				loadQueue.forEach(config => appendStyles(themeStyles(config) || '', config.scope?.replace(/^\./, '')));

				loadQueue = null;
				window.removeEventListener('load', loadListener);
				loadListener = null;
			};

			window.addEventListener('load', loadListener);
		}
	}
};
