export const getCustomProps = object =>
	[...new Set(object ? [...Reflect.ownKeys(object), ...getCustomProps(Object.getPrototypeOf(object))] : [])].filter(
		prop =>
			typeof prop !== 'string' ||
			!prop.match(
				/^(?:constructor|prototype|arguments|caller|name|length|toString|toLocaleString|valueOf|__proto__| __defineGetter__|__defineSetter__|hasOwnProperty|__lookupGetter__|__lookupSetter__|__defineGetter__|isPrototypeOf|propertyIsEnumerable)$/,
			),
	);

export const mixinClass = (baseClass, ...mixins) => {
	const copyProps = (target, source) => {
		// this function copies all properties and symbols, filtering out some special ones
		// WARNING : this will overwrite any props with the name
		getCustomProps(source).forEach(prop =>
			Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop)),
		);
	};

	class base extends baseClass {
		constructor(...args) {
			super(...args);

			mixins.forEach(mixin => copyProps(this, new mixin()));
		}
	}

	mixins.forEach(mixin => {
		// outside constructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
		copyProps(base.prototype, mixin.prototype);
		copyProps(base, mixin);
	});

	return base;
};
