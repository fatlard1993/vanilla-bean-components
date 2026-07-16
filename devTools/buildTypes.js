import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

import { extractJSDoc } from './extractJSDoc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Components need a DOM to import; happy-dom stands in so the schema statics can be read
GlobalRegistrator.register({ width: 1920, height: 1080 });

const library = await import(join(root, 'index.js'));
const { Component } = library;

const GENERATED_START = '// ── GENERATED: Built-in components ────────────────────────────────────────────';
const GENERATED_END = '// ── END GENERATED ────────────────────────────────────────────────────────────';

/**
 * Convert a JSDoc type string (e.g. `{string|Function}`) to a TypeScript type string.
 * @param {string} type - Raw JSDoc type including surrounding braces
 * @returns {string} TypeScript-compatible type string
 */
function jsDocTypeToTS(type) {
	if (!type) return 'any';

	return type
		.trim()
		.replace(/^\{|\}$/g, '')
		.replace(/\*/g, 'any')
		.replace(/\bFunction\b/g, '(...args: any[]) => any')
		.replace(/\bobject\b/g, 'Record<string, any>')
		.replace(/\bArray\b(?!<)/g, 'Array<any>')
		.replace(/\|/g, ' | ')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

const COMPONENT_OPTIONS_KEYS = new Set([
	'tag',
	'autoRender',
	'styles',
	'uniqueId',
	'style',
	'attributes',
	'className',
	'id',
	'textContent',
	'innerText',
	'innerHTML',
	'content',
	'appendTo',
	'prependTo',
	'append',
	'prepend',
	'before',
	'disabled',
	'onclick',
	'onConnected',
	'onDisconnected',
	'onRendered',
	'onPointerPress',
	'onHover',
	'onPointerOver',
	'onPointerEnter',
	'onPointerDown',
	'onPointerMove',
	'onPointerUp',
	'onPointerLeave',
	'onPointerCancel',
	'onContextmenu',
	'onChange',
	'onKeydown',
	'onKeyup',
	'onInput',
	'onBlur',
	'onSearch',
	'addClass',
]);

/**
 * Merges static schema declarations up a component's constructor chain.
 * Parent schemas apply first so child classes override per descriptor field,
 * mirroring the runtime's nearest-class-wins semantics.
 * @param {Function} klass - Component subclass to walk
 * @param {Function} [stopAt] - Ancestor class to stop before (exclusive), so subclasses only report their own keys
 * @returns {object} Merged descriptor info keyed by option name
 */
function collectSchema(klass, stopAt = Component) {
	const chain = [];
	let current = klass;

	while (current && current !== stopAt && current !== Component) {
		if (Object.prototype.hasOwnProperty.call(current, 'schema') && current.schema) chain.unshift(current.schema);
		current = Object.getPrototypeOf(current);
	}

	const merged = {};

	for (const schema of chain) {
		for (const [key, descriptor] of Object.entries(schema)) {
			if (!descriptor) continue;
			const info = (merged[key] ??= {});
			if ('default' in descriptor) {
				info.hasDefault = true;
				try {
					info.default = descriptor.default;
				} catch {
					info.hasDefault = false;
				}
			}
			if ('enum' in descriptor) info.enum = descriptor.enum;
			if ('data' in descriptor) info.data = !!descriptor.data;
		}
	}

	return merged;
}

/**
 * Derive a TypeScript type for a schema key from its enum or default value.
 * @param {object} info - Merged descriptor info from collectSchema
 * @returns {string} TypeScript type string
 */
function schemaKeyType(info) {
	if (info.enum?.length) return info.enum.map(value => JSON.stringify(value)).join(' | ');

	if (info.hasDefault) {
		const type = typeof info.default;
		if (type === 'string' || type === 'number' || type === 'boolean') return type;
		if (type === 'function') return '(...args: any[]) => any';
		if (Array.isArray(info.default)) return 'Array<any>';
		if (type === 'object' && info.default !== null) return 'Record<string, any>';
	}

	return 'any';
}

/**
 * Format a schema default as a doc-comment suffix, primitives only.
 * @param {object} info - Merged descriptor info from collectSchema
 * @returns {string} ' (default: ...)' or empty string
 */
function defaultSuffix(info) {
	if (!info?.hasDefault) return '';
	const type = typeof info.default;
	if (type !== 'string' && type !== 'number' && type !== 'boolean') return '';

	return ` (default: ${JSON.stringify(info.default)})`;
}

/**
 * Generate TypeScript interface and class declaration for a single component.
 * The schema supplies key existence, defaults, and enum unions; JSDoc supplies types and descriptions.
 * Interfaces and class declarations extend the component's nearest exported ancestor,
 * mirroring the runtime hierarchy so inherited options and methods carry through.
 * @param {string} name - Component class name (e.g. "Button")
 * @param {object} jsDoc - Parsed JSDoc object from extractJSDoc
 * @param {object} [schema] - Merged descriptor info from collectSchema
 * @param {object} [bases] - Base names for the generated declarations
 * @param {string} [bases.baseClass] - Class the declared class extends
 * @param {string} [bases.baseInterface] - Interface the options interface extends
 * @returns {string} TypeScript declaration block
 */
function generateComponentInterface(
	name,
	jsDoc,
	schema = {},
	{ baseClass = 'Component', baseInterface = 'ComponentOptions' } = {},
) {
	const lines = [];
	const componentOptions = jsDoc.options.filter(
		opt => (opt.name !== 'options' || opt.isSubProperty) && !COMPONENT_OPTIONS_KEYS.has(opt.name),
	);
	const documentedKeys = new Set(componentOptions.map(opt => opt.name));
	const schemaOnlyKeys = Object.keys(schema).filter(
		key => !documentedKeys.has(key) && !COMPONENT_OPTIONS_KEYS.has(key),
	);
	const methods = jsDoc.methods.filter(m => !m.name.startsWith('_'));

	if (componentOptions.length > 0 || schemaOnlyKeys.length > 0) {
		lines.push(`export interface ${name}Options extends ${baseInterface} {`);
		for (const opt of componentOptions) {
			const info = schema[opt.name];
			// The schema is ground truth for valid values and defaults; JSDoc supplies types and descriptions
			const tsType = info?.enum?.length ? schemaKeyType(info) : jsDocTypeToTS(opt.type);
			const description = `${opt.description || ''}${defaultSuffix(info)}`.trim();
			if (description) lines.push(`\t/** ${description} */`);
			lines.push(`\t${opt.name}?: ${tsType};`);
		}
		for (const key of schemaOnlyKeys) {
			const info = schema[key];
			const description = defaultSuffix(info).trim();
			if (description) lines.push(`\t/** ${description.replace(/^\(|\)$/g, '')} */`);
			lines.push(`\t${key}?: ${schemaKeyType(info)};`);
		}
		lines.push('}');
		lines.push('');
	}

	const getters = jsDoc.properties.filter(p => p.access === 'readonly' && p.type !== 'unknown');

	const optionsType = componentOptions.length > 0 || schemaOnlyKeys.length > 0 ? `${name}Options` : baseInterface;
	lines.push(`export declare class ${name} extends ${baseClass} {`);
	lines.push(`\tconstructor(options?: ${optionsType}, ...children: Array<Elem | HTMLElement | string>);`);

	for (const getter of getters) {
		const tsType = jsDocTypeToTS(`{${getter.type}}`);
		if (getter.description) lines.push(`\t/** ${getter.description} */`);
		lines.push(`\treadonly ${getter.name}: ${tsType};`);
	}

	for (const method of methods) {
		const params = method.parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${jsDocTypeToTS(p.type)}`).join(', ');
		const ret = method.returns ? jsDocTypeToTS(method.returns.type) : 'void';
		if (method.description) lines.push(`\t/** ${method.description} */`);
		lines.push(`\t${method.name}(${params}): ${ret};`);
	}

	lines.push('}');
	lines.push('');

	return lines.join('\n');
}

/**
 * Scan the components directory and build the generated type declaration block.
 * @returns {{ block: string, count: number }} Generated TS source and component count
 */
function buildComponentTypes() {
	const componentsDir = join(root, 'components');
	const dirs = readdirSync(componentsDir, { withFileTypes: true })
		.filter(d => d.isDirectory() && existsSync(join(componentsDir, d.name, `${d.name}.js`)))
		.map(d => d.name)
		.sort();

	// Map exported component classes to their names so subclasses can extend
	// their nearest exported ancestor instead of flattening to Component
	const exportedClasses = new Map();
	for (const dir of dirs) {
		if (typeof library[dir] === 'function') exportedClasses.set(library[dir], dir);
	}

	const nearestAncestor = klass => {
		let current = Object.getPrototypeOf(klass);
		while (current && current !== Component) {
			if (exportedClasses.has(current)) return current;
			current = Object.getPrototypeOf(current);
		}
		return null;
	};

	// First pass: gather each component's JSDoc, own-schema (below its exported ancestor), and parentage
	const components = dirs.map(dir => {
		const klass = library[dir];
		const parentClass = typeof klass === 'function' ? nearestAncestor(klass) : null;
		const schema = typeof klass === 'function' ? collectSchema(klass, parentClass ?? Component) : {};

		return { dir, jsDoc: extractJSDoc(join(componentsDir, dir, `${dir}.js`)), schema, parentClass };
	});

	const hasInterface = new Set(
		components
			.filter(({ jsDoc, schema }) => {
				const documented = jsDoc.options.filter(
					opt => (opt.name !== 'options' || opt.isSubProperty) && !COMPONENT_OPTIONS_KEYS.has(opt.name),
				);
				return documented.length > 0 || Object.keys(schema).some(key => !COMPONENT_OPTIONS_KEYS.has(key));
			})
			.map(({ dir }) => dir),
	);

	const generated = [
		GENERATED_START,
		'// This section is generated by devTools/buildTypes.js - do not edit manually.',
		'// Run `bun run build:types` to regenerate from static schema declarations and JSDoc annotations.',
		'',
	];

	for (const { dir, jsDoc, schema, parentClass } of components) {
		const parentName = parentClass ? exportedClasses.get(parentClass) : null;

		generated.push(
			generateComponentInterface(dir, jsDoc, schema, {
				baseClass: parentName || 'Component',
				baseInterface: parentName && hasInterface.has(parentName) ? `${parentName}Options` : 'ComponentOptions',
			}),
		);
	}

	generated.push(GENERATED_END);

	return { block: generated.join('\n'), count: dirs.length };
}

/**
 * Read index.d.ts, replace the generated component block, and write it back.
 */
function updateIndexDts() {
	const indexDtsPath = join(root, 'index.d.ts');
	const content = readFileSync(indexDtsPath, 'utf8');
	const { block, count } = buildComponentTypes();

	let updated;
	if (content.includes(GENERATED_START) && content.includes(GENERATED_END)) {
		const start = content.indexOf(GENERATED_START);
		const end = content.indexOf(GENERATED_END) + GENERATED_END.length;
		updated = content.slice(0, start) + block + content.slice(end);
	} else {
		const builtInMarker = '// ── Built-in components ──';
		const markerIndex = content.indexOf(builtInMarker);
		updated =
			markerIndex !== -1 ? content.slice(0, markerIndex) + block + '\n' : content.trimEnd() + '\n\n' + block + '\n';
	}

	writeFileSync(indexDtsPath, updated, 'utf8');
	console.log(`✓ index.d.ts updated - ${count} components`);
}

updateIndexDts();
