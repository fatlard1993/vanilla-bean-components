/**
 * Calculates zero-based index position of element within parent's children.
 * @param {HTMLElement} element - Element to find index of
 * @param {number} [index] - Internal recursion accumulator, do not provide
 * @returns {number} Zero-based index position within parent element
 */
export const getElementIndex = (element, index = 0) => {
	if (element.previousElementSibling) return getElementIndex(element.previousElementSibling, ++index);

	return index;
};

/**
 * Determines if element is a descendant of specified parent element.
 * @param {HTMLElement} element - Element to test descendant relationship
 * @param {HTMLElement} parentElement - Potential ancestor element
 * @returns {boolean} True if element is descendant of parentElement, false otherwise
 */
export const isDescendantOf = (element, parentElement) => {
	const isTheParent = element.parentElement === parentElement;

	return !isTheParent && element.parentElement?.parentElement
		? isDescendantOf(element.parentElement, parentElement)
		: isTheParent;
};

/**
 * Finds elements containing specified text using XPath evaluation.
 *
 * Uses XPath contains() function with optional case-insensitive matching.
 * Returns deepest matching elements to avoid duplicate parent/child results.
 * @param {string} text - Text content to search for within elements
 * @param {object} [options] - Search configuration options
 * @param {string} [options.xPathElement] - Element selector for XPath evaluation
 * @param {Node} [options.scope] - Context node to scope the search query
 * @param {boolean} [options.caseSensitive] - Whether to perform case-sensitive text matching
 * @returns {Node[]} Array of elements containing the text, with duplicate parent/child pairs resolved to deepest match
 */
export const getElementsContainingText = (text, options = {}) => {
	const { xPathElement = '*', scope = document.body, caseSensitive = false } = options;

	const esc = str => (!str.includes("'") ? `'${str}'` : `concat('${str.replace(/'/g, "',\"'\",'")}')`);

	const xPath = `.//${xPathElement}[contains(${caseSensitive ? `text(),${esc(text)}` : `translate(.,${esc(text.toUpperCase())},${esc(text.toLowerCase())}),${esc(text.toLowerCase())}`})]`;
	const result = document.evaluate(xPath, scope, null, XPathResult.ANY_TYPE, null);

	let node = null;
	const nodes = [];
	while ((node = result.iterateNext())) {
		if (nodes.length > 0 && nodes.at(-1).contains(node)) nodes[nodes.length - 1] = node;
		else nodes.push(node);
	}

	return nodes;
};
