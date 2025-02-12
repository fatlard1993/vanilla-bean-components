/**
 * Return the index of a target element within its parent
 * @param {HTMLElement} element - The target element
 * @param {number} index - (do not use)
 * @returns {number} index
 */
export const getElementIndex = (element, index = 0) => {
	if (index === undefined) index = 0;

	if (element.previousElementSibling) return getElementIndex(element.previousElementSibling, ++index);

	return index;
};

/**
 * Check if one element is a descendant of another element
 * @param {HTMLElement} element - The target element
 * @param {HTMLElement} parentElement - The potential targets ancestor
 * @returns {boolean} element isDescendantOf parent
 */
export const isDescendantOf = (element, parentElement) => {
	const isTheParent = element.parentElement === parentElement;

	return !isTheParent && element.parentElement?.parentElement
		? isDescendantOf(element.parentElement.parentElement, parentElement)
		: isTheParent;
};

/**
 * Get an array of elements that contain a target piece of text
 * @param {string} text - The target text
 * @param {object} options -
 * @param {string} options.xPathElement - The element selector used in the xPath evaluation, Default: *
 * @param {Node} options.scope - The contextNode to scope the results of the query, Default: document.body
 * @param {boolean} options.caseSensitive - If set to true: elements with an exact case match will be in the result, Default: false
 * @returns {Array} An array of Node results
 */
export const getElementsContainingText = (text, options = {}) => {
	const { xPathElement = '*', scope = document.body, caseSensitive = false } = options;

	const xPath = `.//${xPathElement}[contains(${caseSensitive ? `text(),'${text}'` : `translate(.,'${text.toUpperCase()}','${text.toLowerCase()}'),'${text.toLowerCase()}'`})]`;
	const result = document.evaluate(xPath, scope, null, XPathResult.ANY_TYPE, null);

	let node = null;
	const nodes = [];
	while ((node = result.iterateNext())) {
		if (nodes.length > 0 && nodes.at(-1).contains(node)) nodes[nodes.length - 1] = node;
		else nodes.push(node);
	}

	return nodes;
};
