import { isNodeList } from './dom';

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
