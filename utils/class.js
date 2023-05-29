export const buildClassList = (...classNames) => [
	...new Set(classNames.flat(Infinity).filter(className => typeof className === 'string' && className.length)),
];

export const buildClassName = (...classNames) => buildClassList(...classNames).join(' ');
