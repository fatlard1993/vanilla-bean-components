import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

import { extractExport, extractJSDoc } from './extractJSDoc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Components need a DOM to import; happy-dom stands in so the schema statics can be read
GlobalRegistrator.register({ width: 1920, height: 1080 });

const library = await import(join(root, 'index.js'));
const { Component } = library;

const GENERATED_START = '// ── GENERATED: Built-in components ────────────────────────────────────────────';
const GENERATED_END = '// ── END GENERATED ────────────────────────────────────────────────────────────';
const MODULES_START = '// ── GENERATED: Functions, constants and the rest ─────────────────────────────';
const MODULES_END = '// ── END GENERATED MODULES ────────────────────────────────────────────────────';

/**
 * Convert a JSDoc type string (e.g. `{string|Function}`) to a TypeScript type string.
 * @param {string} type - Raw JSDoc type including surrounding braces
 * @returns {string} TypeScript-compatible type string
 */
function jsDocTypeToTS(type) {
	if (!type) return 'any';

	return (
		type
			.trim()
			.replace(/^\{|\}$/g, '')
			// A typedef imported from another file is declared in this one
			.replace(/import\([^)]*\)\./g, '')
			.replace(/\[\.\.\.(\w+)\]/g, '$1[]')
			.replace(/\*/g, 'any')
			.replace(/\bFunction\b/g, '((...args: any[]) => any)')
			.replace(/\bobject\b/g, 'Record<string, any>')
			.replace(/\bArray\b(?!<)/g, 'Array<any>')
			.replace(/\|/g, ' | ')
			.replace(/\s{2,}/g, ' ')
			.trim()
	);
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

	// A key re-declared below an ancestor (for a new default) keeps the ancestor's valid values
	for (let ancestor = current; ancestor && ancestor !== Component; ancestor = Object.getPrototypeOf(ancestor)) {
		if (!Object.prototype.hasOwnProperty.call(ancestor, 'schema') || !ancestor.schema) continue;

		for (const [key, descriptor] of Object.entries(ancestor.schema)) {
			if (merged[key] && !merged[key].enum && descriptor?.enum) merged[key].enum = descriptor.enum;
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
		let ret = method.returns ? jsDocTypeToTS(method.returns.type) : 'void';
		// A method that returns its own component is chainable from a subclass too
		if (ret === name) ret = 'this';
		if (method.description) lines.push(`\t/** ${method.description} */`);
		lines.push(`\t${method.static ? 'static ' : ''}${method.name}(${params}): ${ret};`);
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

	return { block: generated.join('\n'), count: dirs.length, exportedClasses };
}

const isClass = value => typeof value === 'function' && /^class\b/.test(Function.prototype.toString.call(value));

const isComponentClass = value => isClass(value) && (value === Component || value.prototype instanceof Component);

/**
 * The non-test JavaScript files a module's exports may be declared in.
 * @param {...string} dirs - Folders, from the library's root
 * @returns {string[]} Absolute paths
 */
const sourceFiles = (...dirs) =>
	dirs.flatMap(dir =>
		readdirSync(join(root, dir), { withFileTypes: true })
			.filter(entry => entry.isFile() && entry.name.endsWith('.js') && !/(^|\.)test\.js$|^demo\.js$/.test(entry.name))
			.map(entry => join(root, dir, entry.name)),
	);

const componentSourceFiles = () =>
	readdirSync(join(root, 'components'), { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.flatMap(entry => sourceFiles(join('components', entry.name)));

/**
 * Find the file that declares an export, and read its declaration.
 * @param {string} name - Exported name
 * @param {string[]} files - Files to look through
 * @returns {object|null} `{ file, doc }`, doc from extractExport
 */
function findExport(name, files) {
	for (const file of files) {
		const doc = extractExport(readFileSync(file, 'utf8'), name);

		if (doc) return { file, doc };
	}

	return null;
}

/**
 * A TypeScript type for a constant, from its value.
 * @param {*} value - The exported value
 * @returns {string} TypeScript type string
 */
function valueType(value) {
	if (value === null || value === undefined) return 'any';
	if (typeof value === 'function') return '(...args: any[]) => any';
	if (Array.isArray(value))
		return value.every(item => typeof item === 'string') ? 'ReadonlyArray<string>' : 'Array<any>';
	if (typeof value === 'object') {
		const members = Object.entries(value).map(([key, member]) => {
			const property = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);

			if (typeof member === 'function') return `${property}(...args: any[]): any;`;
			if (typeof member === 'object' && member !== null) return `${property}: Record<string, any>;`;

			return `${property}: ${valueType(member)};`;
		});

		return members.length > 0 ? `{ ${members.join(' ')} }` : 'Record<string, any>';
	}

	return typeof value;
}

/**
 * Parameters as a TypeScript parameter list: the JSDoc's, each optional when its source has a default, or with none
 * documented, the source's own names. A rest parameter becomes `...name: Array<Type>`.
 * @param {object} doc - From extractExport
 * @returns {string} TypeScript parameter list
 */
function parameterList(doc) {
	const inSource = new Map(doc.sourceParameters.map(parameter => [parameter.name, parameter]));
	const parameters = doc.documented
		? doc.parameters.map(parameter => ({
				...parameter,
				optional: parameter.optional || Boolean(inSource.get(parameter.name)?.optional),
				rest: parameter.type.startsWith('...') || Boolean(inSource.get(parameter.name)?.rest),
				type: parameter.type.replace(/^\.\.\./, ''),
			}))
		: doc.sourceParameters.map(parameter => ({ ...parameter, type: '*' }));

	// A required parameter can't follow an optional one: those before the last required one take undefined instead
	let optionalFrom = parameters.length;
	while (optionalFrom > 0 && (parameters[optionalFrom - 1].optional || parameters[optionalFrom - 1].rest))
		optionalFrom--;

	return parameters
		.map(({ name, type, optional, rest }, index) => {
			const tsType = jsDocTypeToTS(`{${type}}`);

			if (rest) return `...${name}: Array<${tsType}>`;
			if (optional && index >= optionalFrom) return `${name}?: ${tsType}`;

			return `${name}: ${tsType}${optional ? ' | undefined' : ''}`;
		})
		.join(', ');
}

/**
 * Declare one non-component export: a function from its JSDoc, a class, or a constant from its value.
 * @param {string} name - Exported name
 * @param {*} value - The runtime value, or undefined to go by the source alone
 * @param {object|null} doc - From extractExport
 * @returns {string} TypeScript declaration
 */
function declareExport(name, value, doc) {
	let kind = doc?.kind ?? 'const';

	if (value !== undefined) kind = typeof value === 'function' ? 'function' : 'const';
	if (isClass(value)) kind = 'class';

	const comment = doc?.description ? `/** ${doc.description} */\n` : '';

	if (kind === 'function' && doc?.type)
		return `${comment}export declare const ${name}: ${jsDocTypeToTS(`{${doc.type}}`)};`;

	if (kind === 'function') {
		const parameters = doc ? parameterList(doc) : '...args: any[]';
		// Undocumented, it could return anything; documented with no @returns, it returns nothing
		let returns = doc?.documented ? 'void' : 'any';

		if (doc?.returns) returns = jsDocTypeToTS(`{${doc.returns.type}}`);

		if (doc?.async && !returns.startsWith('Promise<')) returns = `Promise<${returns}>`;

		return `${comment}export declare function ${name}(${parameters}): ${returns};`;
	}

	if (kind === 'class') {
		const base = doc?.extends ? ` extends ${doc.extends}` : '';

		return `${comment}export declare class ${name}${base} {\n\tconstructor(...args: any[]);\n\t[key: string]: any;\n}`;
	}

	return `${comment}export declare const ${name}: ${valueType(value)};`;
}

/**
 * Declare the `@typedef`s in the files given, which their functions' JSDoc may name.
 * @param {string[]} files - Files to look through
 * @returns {string[]} TypeScript type aliases
 */
function declareTypeAliases(files) {
	return files.flatMap(file =>
		[...readFileSync(file, 'utf8').matchAll(/@typedef\s+\{([^}]+)\}\s+(\w+)/g)].map(
			([, type, name]) => `export type ${name} = ${jsDocTypeToTS(`{${type}}`)};`,
		),
	);
}

/**
 * Declare a module's exports, each found in the files given.
 * @param {object} exports - The module's runtime exports (name to value), or names alone for source-only
 * @param {string[]} files - Where they are declared
 * @param {Set<string>} [skip] - Names declared elsewhere already
 * @returns {string[]} TypeScript declarations
 */
function declareModule(exports, files, skip = new Set()) {
	return Object.entries(exports)
		.filter(([name]) => !skip.has(name))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([name, value]) => declareExport(name, value, findExport(name, files)?.doc ?? null));
}

/**
 * The root module's exports index.d.ts doesn't otherwise declare: utils, the rest of styled, the components' helper
 * classes (View, ColorSwatch, Tag, …) and their utilities.
 * @param {Set<string>} declared - Names already declared, by hand or in the component block
 * @param {Map<Function, string>} exportedClasses - Component classes already declared, to extend
 * @returns {string} The generated block
 */
function buildModuleTypes(declared, exportedClasses) {
	const lines = [MODULES_START, '// This section is generated by devTools/buildTypes.js - do not edit manually.', ''];
	const files = [...sourceFiles('utils', 'styled', 'Component', 'Elem'), ...componentSourceFiles()];
	const remaining = Object.fromEntries(Object.entries(library).filter(([name]) => !declared.has(name)));
	const classes = Object.entries(remaining).filter(([, value]) => isComponentClass(value));

	for (const [name, klass] of classes) {
		let parent = Object.getPrototypeOf(klass);
		while (parent && parent !== Component && !exportedClasses.has(parent)) parent = Object.getPrototypeOf(parent);

		const parentName = exportedClasses.get(parent) ?? 'Component';
		const found =
			findExport(name, files) ??
			findExport(
				'default',
				files.filter(file => file.endsWith(`/${name}.js`)),
			);
		const file = found?.file ?? files.find(path => path.endsWith(`/${name}.js`));
		const jsDoc = file ? extractJSDoc(file) : { options: [], methods: [], properties: [] };

		lines.push(
			generateComponentInterface(name, jsDoc, collectSchema(klass, parent ?? Component), {
				baseClass: parentName,
				baseInterface: parentName === 'Component' ? 'ComponentOptions' : `${parentName}Options`,
			}),
		);
		delete remaining[name];
	}

	lines.push(...declareTypeAliases(files), '');
	lines.push(...declareModule(remaining, files).flatMap(declaration => [declaration, '']));
	lines.push(MODULES_END);

	return lines.join('\n');
}

const APP_HEADER = [
	'// Generated by devTools/buildTypes.js from the JSDoc in app/ - do not edit manually.',
	'// Minimal declarations for IDE recognition, as index.d.ts is for the components.',
	'',
].join('\n');

/**
 * Write a declaration file beside each of the app kit's entry points (package.json `exports`), where TypeScript looks
 * for one.
 * @returns {Promise<string[]>} The files written
 */
async function writeAppTypes() {
	const files = sourceFiles('app');
	const app = await import(join(root, 'app', 'index.js'));
	const written = [];
	const write = async (path, declarations) => {
		writeFileSync(path, await format(`${APP_HEADER}${declarations.join('\n\n')}\n`, path), 'utf8');
		written.push(path);
	};

	await write(join(root, 'app', 'index.d.ts'), [...declareTypeAliases(files), ...declareModule(app, files)]);
	// Read from its source, not imported: in a development shell it would connect as it loads
	await write(join(root, 'app', 'reloadOnBuild.d.ts'), declareModule({ reloadOnBuild: undefined }, files));

	return written;
}

/**
 * Format a declaration file as committed, so regenerating from the pre-push hook leaves no diff behind.
 * @param {string} source - The declarations
 * @param {string} path - Where they go
 * @returns {Promise<string>} The formatted source
 */
async function format(source, path) {
	const prettier = await import('prettier');

	return prettier.format(source, { ...(await prettier.resolveConfig(path)), filepath: path });
}

/**
 * Read index.d.ts, replace the generated component block, and write it back.
 */
async function updateIndexDts() {
	const indexDtsPath = join(root, 'index.d.ts');
	const content = readFileSync(indexDtsPath, 'utf8');
	const { block, count, exportedClasses } = buildComponentTypes();

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

	// Everything else the root exports: what's declared outside this block is left to the hand-written part
	const withoutModules =
		updated.includes(MODULES_START) && updated.includes(MODULES_END)
			? updated.slice(0, updated.indexOf(MODULES_START)) +
				updated.slice(updated.indexOf(MODULES_END) + MODULES_END.length)
			: updated;
	const declared = new Set(
		[...withoutModules.matchAll(/^export (?:declare )?(?:class|function|const|interface|type|enum) (\w+)/gm)].map(
			([, name]) => name,
		),
	);
	for (const [, names] of withoutModules.matchAll(/^export (?:type )?\{([^}]+)\}/gm)) {
		for (const name of names.split(','))
			declared.add(
				name
					.trim()
					.split(/\s+as\s+/)
					.pop(),
			);
	}

	const modules = buildModuleTypes(declared, exportedClasses);
	updated = `${withoutModules.trimEnd()}\n\n${modules}\n`;

	writeFileSync(indexDtsPath, await format(updated, indexDtsPath), 'utf8');
	console.log(`✓ index.d.ts updated - ${count} components, and the rest of the root's exports`);

	for (const path of await writeAppTypes()) console.log(`✓ ${path.slice(root.length + 1)} updated`);
}

await updateIndexDts();
