import { removeExcessIndentation } from '../../utils';

// Fix RegExp stringify-ability
RegExp.prototype.toJSON = RegExp.prototype.toString;

export const stringifyValue = value => {
	if (typeof value === 'string') return value;

	const string = JSON.stringify(
		value,
		(_key, _value) => {
			if (value === undefined) return 'undefined';
			if (_value instanceof Set) return '[object Set]';
			if (Array.isArray(_value)) return '[object Array]';
			if (_value?.isDomElem) return '[object DomElem]';
			if (typeof _value?.toString === 'function') return _value.toString();
			return _value;
		},
		2,
	);

	return removeExcessIndentation(
		(string || '')
			.replaceAll(String.raw`\t`, '\t')
			.replaceAll(String.raw`\n`, '\n')
			.replaceAll(/^"|"$/g, ''),
	);
};
