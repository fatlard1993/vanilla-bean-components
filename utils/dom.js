import state from '../components/state';

export const isMac = () =>
	(window.navigator?.userAgentData?.platform || navigator.platform).toLowerCase().startsWith('mac');

export const isNodeList = nodes => {
	const nodeCount = nodes?.length;
	const nodesString = Object.prototype.toString.call(nodes);
	const stringRegex = /^\[object (HTMLCollection|NodeList|Object)\]$/;

	return (
		typeof nodes === 'object' &&
		typeof nodeCount === 'number' &&
		stringRegex.test(nodesString) &&
		(nodeCount === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0))
	);
};

export const appendStyles = css => {
	const style = document.createElement('style');

	style.innerHTML = css;

	document.head.appendChild(style);
};

export const getPixelDensity = () => {
	const reqTime = performance.now();

	if (state.pixelDensity && state.lastPixelDensityRefresh && reqTime - state.lastPixelDensityRefresh < 5e3) {
		return state.pixelDensity;
	}

	state.lastPixelDensityRefresh = reqTime;

	return (state.pixelDensity = window.devicePixelRatio || 1);
};

export const getScreenOrientation = () => {
	let orientation = 'primary';

	if (window.screen && window.screen.orientation && window.screen.orientation.type)
		orientation = window.screen.orientation.type;
	else if (typeof window.orientation !== 'undefined')
		orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';

	return orientation;
};
