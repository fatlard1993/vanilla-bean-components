import { ValidationError } from './errors';

const isPlainObject = value => !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * The built-in field types. Each parses a request value into what gets stored, throwing a ValidationError for the wrong
 * shape, and knows its own unset value, so a field left out of a create lands as the right kind of empty. `empty` is a
 * factory, so no two records share a list.
 */
export const fieldTypes = {
	// Numbers are taken where text is expected: a phone keyboard sends "7" for a name readily enough
	string: {
		empty: () => '',
		parse: value => {
			if (typeof value === 'string') return value;
			if (typeof value === 'number' && Number.isFinite(value)) return String(value);

			throw new ValidationError('expected text');
		},
	},
	// '' is how an unset number is stored and sent
	number: {
		empty: () => '',
		parse: value => {
			if (value === '' || value === null) return '';
			if (typeof value === 'number' && Number.isFinite(value)) return value;
			if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);

			throw new ValidationError('expected a number');
		},
	},
	boolean: {
		empty: () => false,
		parse: value => {
			if (typeof value === 'boolean') return value;

			throw new ValidationError('expected true or false');
		},
	},
	stringArray: {
		empty: () => [],
		parse: value => {
			if (!Array.isArray(value)) throw new ValidationError('expected a list');

			return value.map(entry => fieldTypes.string.parse(entry));
		},
	},
	object: {
		empty: () => ({}),
		parse: value => {
			if (!isPlainObject(value)) throw new ValidationError('expected an object');

			return value;
		},
	},
	// Stored as given: for a field whose shape is the app's business
	any: {
		empty: () => '',
		parse: value => value,
	},
};

/**
 * Reserved keys land on the prototype instead of in a collection, and inherited ones (`toString`) look stored when
 * they aren't. Ids are generated, so the only way one arrives is a hand-written request.
 * @param {*} key - A would-be record id
 * @returns {boolean} Whether it can name a record
 */
export const isSafeKey = key =>
	typeof key === 'string' && key !== '' && !['__proto__', 'constructor', 'prototype'].includes(key);

const SPEC_KEYS = ['type', 'required', 'default', 'validate'];

/**
 * A fields option in any of its shorthands, made uniform: a list of names (stored as given, '' when missing), a map of
 * name to default value (a function default is called per record), or a map of name to
 * `{ type, required, default, validate }`. `validate` is the client's: `value => message`, what's wrong or nothing, or a
 * list of them, so one function checks a field in a Form and in the store.
 * @param {Array<string>|object} fields - The fields option
 * @returns {object} name -> { type, required, default, validate }
 */
export const normalizeFields = fields => {
	if (Array.isArray(fields)) return Object.fromEntries(fields.map(name => [name, { type: fieldTypes.any }]));

	return Object.fromEntries(
		Object.entries(fields ?? {}).map(([name, spec]) => {
			const isSpec = isPlainObject(spec) && Object.keys(spec).some(key => SPEC_KEYS.includes(key));
			const { type = 'any', required = false, validate, ...rest } = isSpec ? spec : { default: spec };
			const resolvedType = typeof type === 'string' ? fieldTypes[type] : type;

			if (!resolvedType?.parse) throw new Error(`Field "${name}" has an unknown type: ${type}`);

			return [
				name,
				{
					type: resolvedType,
					required,
					...(validate && { validate }),
					...('default' in rest && { default: rest.default }),
				},
			];
		}),
	);
};

const emptyFor = spec => {
	if ('default' in spec) return typeof spec.default === 'function' ? spec.default() : structuredClone(spec.default);

	return spec.type.empty();
};

/**
 * A request body checked against normalized fields: only known fields come back, parsed. Throws a ValidationError
 * naming the field for anything of the wrong shape, a required field missing or empty, or a value its `validate` finds
 * wrong (with that message).
 * @param {object} fields - From normalizeFields
 * @param {object} data - The raw body
 * @param {object} [options] - Options
 * @param {boolean} [options.partial] - An update: absent fields are left out rather than defaulted
 * @returns {object} The fields to store
 */
export const validateFields = (fields, data, { partial = false } = {}) => {
	if (!isPlainObject(data)) throw new ValidationError('expected an object body');

	const result = {};

	for (const [name, spec] of Object.entries(fields)) {
		const value = data[name];

		if (value === undefined) {
			if (partial) continue;
			if (spec.required) throw new ValidationError(`${name} is required`);

			result[name] = emptyFor(spec);
			continue;
		}

		try {
			result[name] = spec.type.parse(value);
		} catch (error) {
			throw new ValidationError(`${name}: ${error.message}`);
		}

		if (spec.required && (result[name] === '' || result[name] === null))
			throw new ValidationError(`${name} is required`);

		const [message] = [spec.validate]
			.flat()
			.filter(check => typeof check === 'function')
			.map(check => check(result[name]))
			.filter(Boolean);

		if (message) throw new ValidationError(`${name}: ${message}`);
	}

	return result;
};
