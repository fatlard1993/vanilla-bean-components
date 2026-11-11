/**
 * The usage rules (docs/USAGE_RULES.md) that a pattern in the source can find, as ESLint rules named by their ids:
 * `vbc/form.no-raw-fields` is form.no-raw-fields. They see one file at a time, so a component is known by how it was
 * made in that file (`new Button(...)`, or a variable or property holding one); what they can't place, they leave alone.
 * A pattern an app's own helper produces is reported once, in the helper, as the doc's helper rule asks.
 */

const DOC = 'https://github.com/fatlard1993/vanilla-bean-components/blob/main/docs/USAGE_RULES.md';
const VALUE_COMPONENTS = new Set(['Input', 'Select', 'TagList', 'ColorPicker', 'RadioButton']);
const POPOVERS = new Set(['Popover', 'ContextMenu', 'Notify', 'Tooltip']);
const RAW_FIELDS = new Set(['input', 'textarea', 'select', 'option', 'optgroup']);
const TOGGLE_CLASSES = new Set(['active', 'selected', 'on', 'pressed', 'toggled', 'checked']);

/**
 * The name a property is written with, when it is written plainly.
 * @param {object} property - A Property node
 * @returns {string|undefined} Its key
 */
const keyOf = property => {
	if (property.type !== 'Property' || property.computed) return undefined;

	return property.key.type === 'Identifier' ? property.key.name : property.key.value;
};

/**
 * A property of an object literal, by name.
 * @param {object} object - An ObjectExpression
 * @param {string} name - The key
 * @returns {object|undefined} The Property node
 */
const propertyOf = (object, name) => object?.properties.find(property => keyOf(property) === name);

/**
 * The options object a component was made with, when it was written in place.
 * @param {object} newExpression - A NewExpression
 * @returns {object|undefined} The ObjectExpression
 */
const optionsOf = newExpression => newExpression.arguments.find(argument => argument.type === 'ObjectExpression');

/**
 * The class a NewExpression constructs, by name: `new Button()` and `new vbc.Button()` are both Button, and with the
 * context, an app's own `styled(Button, ...)` or subclass of it is too.
 * @param {object} newExpression - A NewExpression
 * @param {object} [context] - The rule context, to follow the file's own names back to a library class
 * @returns {string|undefined} The class name
 */
const constructed = (newExpression, context) => {
	const { callee } = newExpression;

	if (callee.type === 'Identifier') return context ? baseOf(context, callee) : callee.name;
	if (callee.type === 'MemberExpression' && !callee.computed) return callee.property.name;

	return undefined;
};

/**
 * The library class a name stands for, through the file's own `styled(Base, ...)` and `class X extends Base`, so an
 * app's `const Editor = styled(Input, ...)` is an Input. A name defined any other way is itself.
 * @param {object} context - The rule context
 * @param {object} identifier - An Identifier naming a class
 * @param {number} [depth] - Guards against a cycle of names
 * @returns {string} The class name
 */
const baseOf = (context, identifier, depth = 0) => {
	const definition = depth < 5 && variableOf(context, identifier)?.defs.at(-1);
	const fromExpression = expression => {
		if (expression?.type === 'Identifier') return baseOf(context, expression, depth + 1);
		if (expression?.type === 'CallExpression' && expression.callee.name === 'styled')
			return fromExpression(expression.arguments[0]);

		return undefined;
	};

	if (definition?.type === 'Variable') return fromExpression(definition.node.init) ?? identifier.name;
	if (definition?.type === 'ClassName') return fromExpression(definition.node.superClass) ?? identifier.name;

	return identifier.name;
};

/**
 * The variable a name refers to, looked up from where it is used.
 * @param {object} context - The rule context
 * @param {object} identifier - An Identifier node
 * @returns {object|undefined} The scope variable
 */
const variableOf = (context, identifier) => {
	for (let scope = context.sourceCode.getScope(identifier); scope; scope = scope.upper) {
		const variable = scope.set.get(identifier.name);

		if (variable) return variable;
	}

	return undefined;
};

/**
 * Every `this.<name> = new X()` in the class around a node, so `this.save.elem.disabled` knows `save` is a Button.
 * @param {object} node - Any node inside a class
 * @param {string} name - The property name
 * @returns {object|undefined} The NewExpression assigned
 */
const classFieldInit = (node, name) => {
	let classBody = node.parent;

	while (classBody && classBody.type !== 'ClassBody') classBody = classBody.parent;
	if (!classBody) return undefined;

	let found;
	const visit = child => {
		if (found || !child || typeof child.type !== 'string') return;
		if (
			child.type === 'AssignmentExpression' &&
			child.left.type === 'MemberExpression' &&
			child.left.object.type === 'ThisExpression' &&
			!child.left.computed &&
			child.left.property.name === name &&
			child.right.type === 'NewExpression'
		) {
			found = child.right;

			return;
		}

		for (const key of Object.keys(child)) {
			if (key === 'parent') continue;

			const value = child[key];

			if (Array.isArray(value)) value.forEach(visit);
			else if (value && typeof value.type === 'string') visit(value);
		}
	};

	visit(classBody);

	return found;
};

/**
 * The component class an expression holds, as far as this file shows: made in place, or held by a `const`/`let` or a
 * class property it was made into.
 * @param {object} context - The rule context
 * @param {object} node - An expression
 * @param {number} [depth] - Guards against following a chain of names forever
 * @returns {string|undefined} The class name
 */
const componentOf = (context, node, depth = 0) => {
	if (!node || depth > 5) return undefined;
	if (node.type === 'NewExpression') return constructed(node, context);
	if (node.type === 'Identifier') {
		const definition = variableOf(context, node)?.defs.at(-1);

		return definition?.node.type === 'VariableDeclarator'
			? componentOf(context, definition.node.init, depth + 1)
			: undefined;
	}
	if (node.type === 'MemberExpression' && node.object.type === 'ThisExpression' && !node.computed) {
		const init = classFieldInit(node, node.property.name);

		return init && constructed(init, context);
	}

	return undefined;
};

/**
 * Whether the field a NewExpression makes is handed to a Label elsewhere in the file: held by a name (`const name =` or
 * `this.name =`) that a `new Label(...)` takes as a child, in `append`, or as `for`.
 * @param {object} context - The rule context
 * @param {object} node - The field's NewExpression
 * @returns {boolean} Whether a Label takes it
 */
const labelledLater = (context, node) => {
	const { parent } = node;
	const heldAs = () => {
		if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier')
			return candidate => candidate.type === 'Identifier' && candidate.name === parent.id.name;

		const { left } = parent;

		if (parent.type !== 'AssignmentExpression' || left.type !== 'MemberExpression') return undefined;
		if (left.object.type !== 'ThisExpression' || left.computed) return undefined;

		return candidate =>
			candidate.type === 'MemberExpression' &&
			candidate.object.type === 'ThisExpression' &&
			!candidate.computed &&
			candidate.property.name === left.property.name;
	};
	const held = heldAs();

	if (!held) return false;

	const takes = argument => {
		if (!argument) return false;
		if (held(argument)) return true;
		if (argument.type === 'ArrayExpression') return argument.elements.some(takes);
		if (argument.type === 'ObjectExpression')
			return ['append', 'for'].some(name => takes(propertyOf(argument, name)?.value));

		return false;
	};

	let found = false;
	const visit = child => {
		if (found || !child || typeof child.type !== 'string') return;
		if (child.type === 'NewExpression' && constructed(child, context) === 'Label' && child.arguments.some(takes)) {
			found = true;

			return;
		}

		for (const key of Object.keys(child)) {
			if (key === 'parent') continue;

			const value = child[key];

			if (Array.isArray(value)) value.forEach(visit);
			else if (value && typeof value.type === 'string') visit(value);
		}
	};

	visit(context.sourceCode.ast);

	return found;
};

/**
 * `<something>.elem`, the component's element reached around its options.
 * @param {object} node - A MemberExpression
 * @returns {object|undefined} The component expression before `.elem`
 */
const elemOwner = node =>
	node?.type === 'MemberExpression' && !node.computed && node.property.name === 'elem' ? node.object : undefined;

/**
 * A string literal's value, or a template literal's when it has no expressions.
 * @param {object} node - Any node
 * @returns {string|undefined} The text
 */
const stringOf = node => {
	if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
	if (node?.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;

	return undefined;
};

/**
 * Builds a rule from its id, the one-line message, and its visitors.
 * @param {string} id - The usage rule's id
 * @param {string} message - What's wrong and what to do instead
 * @param {Function} create - (context, report) => visitors, where report(node, loc?) files the message
 * @returns {object} An ESLint rule
 */
const rule = (id, message, create) => ({
	meta: {
		type: 'suggestion',
		docs: { description: message, url: `${DOC}#${id}` },
		messages: { [id]: `${message} (usage rule ${id})` },
		schema: [],
	},
	create: context => create(context, (node, loc) => context.report({ node, messageId: id, ...(loc && { loc }) })),
});

const rules = {
	'overlay.popover-close': rule(
		'overlay.popover-close',
		'Close a Popover, ContextMenu, Notify or Tooltip with close() or destroy(); elem.remove() skips its cleanup',
		(context, report) => ({
			CallExpression(node) {
				const { callee } = node;

				if (callee.type !== 'MemberExpression' || callee.computed || callee.property.name !== 'remove') return;

				const owner = elemOwner(callee.object);

				if (owner && POPOVERS.has(componentOf(context, owner))) report(node);
			},
		}),
	),

	'overlay.emptystate-options': rule(
		'overlay.emptystate-options',
		"EmptyState takes title and message, not Dialog's header and body",
		(context, report) => ({
			NewExpression(node) {
				if (constructed(node, context) !== 'EmptyState') return;

				const options = optionsOf(node);

				for (const name of ['header', 'body']) {
					const property = propertyOf(options, name);

					if (property) report(property);
				}
			},
		}),
	),

	'action.icon-only-named': rule(
		'action.icon-only-named',
		'An icon-only Button needs a name: a tooltip, a title or an aria-label',
		(context, report) => ({
			NewExpression(node) {
				if (constructed(node, context) !== 'Button') return;

				const options = optionsOf(node);

				if (!options || !propertyOf(options, 'icon')) return;
				if (options.properties.some(property => property.type === 'SpreadElement')) return;

				const attributes = propertyOf(options, 'attributes')?.value;

				// Attributes held in a variable can't be read here
				if (attributes && attributes.type !== 'ObjectExpression') return;

				const named =
					['textContent', 'content', 'append', 'tooltip', 'title', 'aria-label', 'aria-labelledby'].some(name =>
						propertyOf(options, name),
					) || ['title', 'aria-label', 'aria-labelledby'].some(name => propertyOf(attributes, name));

				if (!named) report(node);
			},
		}),
	),

	'action.icon-option': rule(
		'action.icon-option',
		"A Button's or Link's glyph goes in the icon option, not an appended Icon or <i>",
		(context, report) => ({
			NewExpression(node) {
				if (!['Button', 'Link'].includes(constructed(node, context))) return;

				const append = propertyOf(optionsOf(node), 'append')?.value;
				const parts = append?.type === 'ArrayExpression' ? append.elements : [append];

				for (const part of parts) {
					if (part?.type !== 'NewExpression') continue;

					const isIcon =
						constructed(part, context) === 'Icon' || stringOf(propertyOf(optionsOf(part), 'tag')?.value) === 'i';

					if (isIcon) report(part);
				}
			},
		}),
	),

	'action.toggle-pressed': rule(
		'action.toggle-pressed',
		"A Button that stays on or off shows it with pressed, not a class of the app's own",
		(context, report) => ({
			CallExpression(node) {
				const { callee } = node;

				if (callee.type !== 'MemberExpression' || callee.computed) return;
				if (!['toggleClass', 'addClass'].includes(callee.property.name)) return;
				if (!TOGGLE_CLASSES.has(stringOf(node.arguments[0]))) return;

				if (componentOf(context, callee.object) === 'Button') report(node);
			},
		}),
	),

	'action.disabled-option': rule(
		'action.disabled-option',
		'Disable a component through its disabled option; elem.disabled skips aria-disabled and the styles',
		(context, report) => ({
			AssignmentExpression(node) {
				const { left } = node;

				if (left.type !== 'MemberExpression' || left.computed || left.property.name !== 'disabled') return;
				if (elemOwner(left.object)) report(node);
			},
		}),
	),

	'action.no-handbuilt-button': rule(
		'action.no-handbuilt-button',
		"Use Button, not a <button> built by hand or tag: 'button' on another component",
		(context, report) => ({
			CallExpression(node) {
				const { callee } = node;

				if (
					callee.type === 'MemberExpression' &&
					!callee.computed &&
					callee.property.name === 'createElement' &&
					stringOf(node.arguments[0]) === 'button'
				)
					report(node);

				if (callee.type !== 'Identifier' || callee.name !== 'styled') return;
				if (node.arguments[0]?.type === 'Identifier' && baseOf(context, node.arguments[0]) === 'Button') return;

				const options = node.arguments.slice(1).find(argument => argument.type === 'ObjectExpression');
				const tag = propertyOf(options, 'tag');

				if (stringOf(tag?.value) === 'button') report(tag);
			},
			NewExpression(node) {
				if (constructed(node, context) === 'Button') return;

				const tag = propertyOf(optionsOf(node), 'tag');

				if (stringOf(tag?.value) === 'button') report(tag);
			},
		}),
	),

	'layout.route-paths': rule(
		'layout.route-paths',
		'Route paths are lowercase kebab-case (/fields, not /Fields)',
		(context, report) => {
			const checkRoutes = routes => {
				for (const property of routes?.properties ?? []) {
					const path = keyOf(property);
					const segments = typeof path === 'string' ? path.split('/') : [];

					if (segments.some(segment => !segment.startsWith(':') && /[A-Z_ ]/.test(segment))) report(property.key);
				}
			};

			return {
				NewExpression(node) {
					if (constructed(node, context) !== 'Router') return;

					let routes = propertyOf(optionsOf(node), 'views')?.value;

					if (routes?.type === 'Identifier') {
						routes = variableOf(context, routes)?.defs.at(-1)?.node.init;
					}

					if (routes?.type === 'ObjectExpression') checkRoutes(routes);
				},
			};
		},
	),

	'form.read-options-value': rule(
		'form.read-options-value',
		"An Input's value is input.options.value, kept up to date as it's typed; not input.elem.value",
		(context, report) => ({
			MemberExpression(node) {
				if (node.computed || node.property.name !== 'value') return;

				const owner = elemOwner(node.object);
				const component = owner && componentOf(context, owner);

				if (component ? VALUE_COMPONENTS.has(component) : owner) report(node);
			},
		}),
	),

	'form.placeholder-not-label': rule(
		'form.placeholder-not-label',
		'A placeholder is never the only label: give the field a Label, an aria-label or a title',
		(context, report) => ({
			NewExpression(node) {
				if (!['Input', 'Select'].includes(constructed(node, context))) return;

				const options = optionsOf(node);
				const attributes = propertyOf(options, 'attributes')?.value;
				const placeholder =
					propertyOf(options, 'placeholder') ??
					(attributes?.type === 'ObjectExpression' ? propertyOf(attributes, 'placeholder') : undefined);

				if (!placeholder) return;
				if (options.properties.some(property => property.type === 'SpreadElement')) return;

				const named =
					['label', 'title', 'aria-label', 'aria-labelledby'].some(name => propertyOf(options, name)) ||
					(attributes?.type === 'ObjectExpression' &&
						['title', 'aria-label', 'aria-labelledby', 'id'].some(name => propertyOf(attributes, name)));
				const { parent } = node;
				const inLabel =
					(parent.type === 'NewExpression' && constructed(parent, context) === 'Label') ||
					(parent.type === 'ArrayExpression' &&
						parent.parent.type === 'Property' &&
						keyOf(parent.parent) === 'append' &&
						constructed(parent.parent.parent.parent, context) === 'Label') ||
					(parent.type === 'Property' &&
						keyOf(parent) === 'append' &&
						constructed(parent.parent.parent, context) === 'Label');

				if (!named && !inLabel && !labelledLater(context, node)) report(placeholder);
			},
		}),
	),

	'form.no-raw-fields': rule(
		'form.no-raw-fields',
		'Build fields with Input and Select, not raw <input>, <textarea>, <select>, <option> or <optgroup>',
		(context, report) => ({
			CallExpression(node) {
				const { callee } = node;

				if (callee.type !== 'MemberExpression' || callee.computed || callee.property.name !== 'createElement') return;
				if (RAW_FIELDS.has(stringOf(node.arguments[0]))) report(node);
			},
			NewExpression(node) {
				const name = constructed(node, context);
				const tag = propertyOf(optionsOf(node), 'tag');
				const value = stringOf(tag?.value);

				if (!RAW_FIELDS.has(value)) return;
				if (name === 'Input' && ['input', 'textarea'].includes(value)) return;

				report(tag);
			},
		}),
	),

	'structure.sectionlabel-margin': rule(
		'structure.sectionlabel-margin',
		"Leave a SectionLabel's margin alone; space it with its container's gap or padding",
		(context, report) => ({
			NewExpression(node) {
				if (constructed(node, context) !== 'SectionLabel') return;

				const style = propertyOf(optionsOf(node), 'style')?.value;

				for (const property of style?.properties ?? []) {
					if (/^margin/.test(keyOf(property) ?? '')) report(property);
				}
			},
			AssignmentExpression(node) {
				const { left } = node;

				if (left.type !== 'MemberExpression' || left.computed || !/^margin/.test(left.property.name)) return;

				const style = left.object;

				if (style.type !== 'MemberExpression' || style.computed || style.property.name !== 'style') return;

				const owner = elemOwner(style.object) ?? style.object;

				if (componentOf(context, owner) === 'SectionLabel') report(node);
			},
		}),
	),

	'structure.card-accent': rule(
		'structure.card-accent',
		"A Card's colored edge is its accent option, not a hand-made border-left or inset shadow",
		(context, report) => ({
			NewExpression(node) {
				if (constructed(node, context) !== 'Card') return;

				const style = propertyOf(optionsOf(node), 'style')?.value;

				for (const property of style?.properties ?? []) {
					const key = keyOf(property) ?? '';
					const edge = /^border(Left|InlineStart)/.test(key);
					const inset = key === 'boxShadow' && /\binset\b/.test(stringOf(property.value) ?? '');

					if (edge || inset) report(property);
				}
			},
		}),
	),

	'structure.list-nostyle': rule(
		'structure.list-nostyle',
		"An unbulleted List is List's noStyle option, not list-style: none by hand",
		(context, report) => ({
			Property(node) {
				if (['listStyle', 'listStyleType'].includes(keyOf(node)) && stringOf(node.value) === 'none') report(node);
			},
			// A styled template: reported at the declaration's own line, and not under a summary, whose list-style hides
			// the disclosure marker rather than a list's bullets
			TemplateElement(node) {
				const { raw } = node.value;

				for (const match of raw.matchAll(/list-style(-type)?\s*:\s*none/g)) {
					const before = raw.slice(0, match.index);
					const open = before.lastIndexOf('{');
					const selector = before.slice(
						Math.max(before.lastIndexOf('}', open), before.lastIndexOf(';', open)) + 1,
						open,
					);

					if (/summary|details|::marker/.test(selector)) continue;

					const lines = before.split('\n');
					const line = node.loc.start.line + lines.length - 1;
					const column = lines.length > 1 ? lines.at(-1).length : node.loc.start.column + 1 + before.length;

					report(node, { start: { line, column }, end: { line, column: column + match[0].length } });
				}
			},
		}),
	),
};

module.exports = { meta: { name: 'vbc' }, rules };
