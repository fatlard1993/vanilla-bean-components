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

export const empty = elem_s => {
	if (isNodeList(elem_s)) return [].slice.call(elem_s).forEach(elem => empty(elem));

	if (!elem_s || !elem_s.lastChild) return;

	while (elem_s.lastChild) elem_s.removeChild(elem_s.lastChild);
};

export const remove = elem_s => {
	if (isNodeList(elem_s)) elem_s = [].slice.call(elem_s);

	elem_s?.parentElement?.removeChild(elem_s);
};

export const getElemIndex = (elem, index) => {
	if (typeof index === 'undefined') index = 0;

	if (elem.previousElementSibling) return getElemIndex(elem.previousElementSibling, ++index);

	return index;
};

export const isDescendantOf = (elem, parent) => {
	const isTheParent = elem.parentElement === parent;

	return !isTheParent && elem.parentElement.parentElement
		? isDescendantOf(elem.parentElement.parentElement, parent)
		: isTheParent;
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
