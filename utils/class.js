import dom from './dom';

export const buildClassList = (...classNames) => {
	return [...new Set(classNames.flat(Infinity).filter(className => typeof className === 'string' && className.length))];
};

export const buildClassName = (...classNames) => {
	return buildClassList(...classNames).join(' ');
};

export const classList = (elem_s, add_remove, classes) => {
	if (dom.isNodeList(elem_s)) elem_s = [].slice.call(elem_s);

	const elemCount = elem_s.length;

	if (elem_s && elemCount) {
		elem_s = elem_s.slice(0);

		for (let x = 0, elem; x < elemCount; ++x) {
			elem = elem_s[x];

			if (elem) elem.classList[add_remove](classes);
		}
	} else if (elem_s && elem_s.parentElement) elem_s.classList[add_remove](classes);
};
