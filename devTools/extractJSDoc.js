import { readFileSync } from 'fs';

/**
 * Extracts JSDoc information from JavaScript files for documentation generation.
 *
 * Parses JSDoc comments and extracts component descriptions, parameters, methods,
 * properties, and events for automated README generation.
 * @param {string} filePath - Path to JavaScript file to parse
 * @returns {object} Extracted JSDoc information structured for documentation templates
 */
export function extractJSDoc(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');

		return {
			description: extractDescription(content),
			options: extractOptions(content),
			methods: extractMethods(content),
			properties: extractProperties(content),
			events: extractEvents(content),
			imports: extractImports(content),
			examples: extractExamples(content),
		};
	} catch (error) {
		console.warn(`Failed to extract JSDoc from ${filePath}:`, error.message);
		return {
			description: '',
			options: [],
			methods: [],
			properties: [],
			events: [],
			imports: [],
			examples: [],
		};
	}
}

/**
 * Extracts component description from class-level JSDoc comment.
 * @param {string} content - File content to parse
 * @returns {string} Component description text
 */
function extractDescription(content) {
	// Match class JSDoc comment - handle both export default class and class patterns
	const classMatches = [
		content.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*export\s+default\s+class\s+\w+/),
		content.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*(?:export\s+)?class\s+\w+/),
	];

	const classMatch = classMatches.find(match => match);
	if (!classMatch) return '';

	const jsdoc = classMatch[1];

	// Extract description (everything before first @tag)
	const descMatch = jsdoc.match(/^\s*\*\s*(.+?)(?=\s*^\s*\*\s*@|\s*$)/ms);

	if (!descMatch) return '';

	// Clean up the description text - handle multi-line descriptions
	const lines = descMatch[1].split('\n');
	const cleanedLines = lines.map(line => line.replace(/^\s*\*\s?/, '')).filter(line => line.trim() !== '');

	return cleanedLines.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts constructor options from JSDoc `@param` tags.
 * @param {string} content - File content to parse
 * @returns {Array} Array of option objects with name, type, description, and default
 */
function extractOptions(content) {
	// Find class-level JSDoc (which contains constructor info) or constructor JSDoc
	const jsDocMatches = [
		content.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*export\s+default\s+class\s+\w+/),
		content.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*constructor\s*\(/),
		content.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*(?:export\s+)?class\s+\w+/),
	];

	const jsDocMatch = jsDocMatches.find(match => match);
	if (!jsDocMatch) return [];

	const jsdoc = jsDocMatch[1];

	// Extract @param tags for options (handle both options.prop and direct param patterns)
	const paramMatches = [
		// options.property pattern
		...jsdoc.matchAll(
			/^\s*\*\s*@param\s+{([^}]+)}\s+(\[?options\.(\w+)(?:=([^\]]+))?\]?)\s*-\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$|\s*\*\/)/gms,
		),
		// Direct parameter pattern (for constructor params like options={})
		...jsdoc.matchAll(
			/^\s*\*\s*@param\s+{([^}]+)}\s+(\[?(\w+)(?:=([^\]]+))?\]?)\s*-\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$|\s*\*\/)/gms,
		),
	];

	const codeDefaults = extractDefaultOptionsFromCode(content);

	return paramMatches
		.filter(match => match[2].includes('options.'))
		.map(match => {
			const [, type, fullParam, name, defaultValue, description] = match;
			const optional = fullParam.startsWith('[') && fullParam.endsWith(']');
			const optionName = name.replace('options.', '');

			return {
				name: optionName,
				type: type.trim(),
				description: description.trim().replace(/\s+/g, ' '),
				optional,
				default: defaultValue || codeDefaults[optionName] || null,
				isSubProperty: fullParam.includes('options.'),
			};
		});
}

/**
 * Reads the `defaultOptions` object literal from source and extracts simple key→value pairs.
 * Only captures string, number, and boolean literals - skips getters and complex values.
 * @param {string} content - File content
 * @returns {object} Map of option name → default value string
 */
function extractDefaultOptionsFromCode(content) {
	const defaults = {};
	const block = content.match(/const\s+defaultOptions\s*=\s*\{([\s\S]*?)\};/);
	if (!block) return defaults;

	const pairs = [
		...block[1].matchAll(/\b(\w+):\s*(?:'([^']*)'|"([^"]*)"|(`[^`]*`)|(-?\d+\.?\d*(?:e[+-]?\d+)?)|true|false)/g),
	];

	pairs.forEach(match => {
		const [full, key, singleQuoted, doubleQuoted, template, number] = match;
		if (singleQuoted !== undefined) defaults[key] = `'${singleQuoted}'`;
		else if (doubleQuoted !== undefined) defaults[key] = `"${doubleQuoted}"`;
		else if (template !== undefined) defaults[key] = template;
		else if (number !== undefined) defaults[key] = number;
		else if (full.endsWith('true')) defaults[key] = 'true';
		else if (full.endsWith('false')) defaults[key] = 'false';
	});

	return defaults;
}

/**
 * Extracts method information from JSDoc comments.
 * @param {string} content - File content to parse
 * @returns {Array} Array of method objects with name, description, parameters, and return info
 */
function extractMethods(content) {
	// Match method JSDoc comments (excluding constructor and private methods)
	// Match JSDoc comments that are within the class body, not at class level

	// Find class body content (everything between class declaration and closing brace)
	const classBodyMatch = content.match(/class\s+\w+[^{]*\{([\s\S]*)\}[^}]*$/);
	if (!classBodyMatch) return [];

	const classBody = classBodyMatch[1];

	// Match each JSDoc block with the method that IMMEDIATELY follows it.
	// `(?:(?!\/\*\*)[\s\S])*?` - non-greedy content that cannot cross into a new `/**`,
	// so the captured block can never span multiple JSDoc comments or method bodies.
	// get/set accessors are excluded; underscore-prefixed names are excluded.
	const matches = [
		...classBody.matchAll(
			/\/\*\*((?:(?!\/\*\*)[\s\S])*?)\*\/[ \t]*\n[ \t]*(static\s+)?(?!constructor\b)(?!get\b)(?!set\b)(?!_)(\w+)\s*\([^)]*\)\s*\{/g,
		),
	];

	return matches.map(([, jsdoc, isStatic, name]) => ({ name, static: Boolean(isStatic), ...parseJSDocBlock(jsdoc) }));
}

/**
 * Reads one JSDoc block: its description, its top-level parameters (`options.x` sub-properties are left out), and its
 * return type.
 * @param {string} jsdoc - The block's text, between its opening and closing markers
 * @returns {object} `{ description, parameters, returns, type }`, type being a whole `@type` tag's
 */
export function parseJSDocBlock(jsdoc) {
	// The description is everything before the first tag, however many lines it runs to
	const description = jsdoc
		.split(/^\s*\*\s*@/m)[0]
		.split('\n')
		.map(line => line.replace(/^\s*\*\s?/, ''))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();

	// Extract parameters
	const paramMatches = [
		...jsdoc.matchAll(
			/^\s*\*\s*@param\s+{((?:[^{}]|\{[^{}]*\})+)}\s+(\[?(\w+)(?:=([^\]]+))?\]?)\s*-\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$|\s*$(?![\s\S]))/gms,
		),
	];

	const parameters = paramMatches.map(paramMatch => {
		const [, type, fullParam, name, defaultValue, desc] = paramMatch;
		const optional = fullParam.startsWith('[') && fullParam.endsWith(']');

		return {
			name,
			type: type.trim(),
			description: desc.trim().replace(/\s+/g, ' '),
			optional,
			default: defaultValue || null,
		};
	});

	// Extract return information - type only; description is not used in type generation.
	const returnMatch = jsdoc.match(/^\s*\*\s*@returns?\s+\{((?:[^{}]|\{[^{}]*\})+)\}/m);

	// A one-line `@type {...} description` block, as for an arrow function typed whole
	const typeMatch = jsdoc.match(/@type\s+\{((?:[^{}]|\{[^{}]*\})+)\}\s*([^@]*)/);

	return {
		description: description || (typeMatch?.[2].replace(/\s*\*\s*/g, ' ').trim() ?? ''),
		parameters,
		returns: returnMatch ? { type: returnMatch[1].trim() } : null,
		type: typeMatch?.[1].trim() ?? null,
	};
}

/**
 * Splits a parameter list's source into its parameters: each one's name (`options` for a destructured one), and
 * whether it has a default or is a rest parameter.
 * @param {string} source - The text between a function's parentheses
 * @returns {Array<object>} `{ name, optional, rest }` for each parameter
 */
function sourceParameters(source) {
	const parameters = [];
	let depth = 0;
	let current = '';

	for (const character of `${source},`) {
		if ('([{'.includes(character)) depth++;
		if (')]}'.includes(character)) depth--;

		if (character === ',' && depth === 0) {
			const text = current.trim();
			const rest = text.startsWith('...');
			const name = text.replace(/^\.\.\./, '').match(/^\w+/)?.[0] ?? 'options';

			if (text) parameters.push({ name, optional: text.includes('='), rest });
			current = '';
		} else current += character;
	}

	return parameters;
}

/**
 * Finds a module's exported declaration by name, and the JSDoc block just before it.
 * @param {string} content - File content to parse
 * @param {string} name - The exported name
 * @returns {object|null} `{ kind, extends, documented, async, description, parameters, returns, type, sourceParameters }`, kind
 *   being 'function', 'class' or 'const'; null when the file doesn't declare it
 */
export function extractExport(content, name) {
	const match = content.match(
		new RegExp(
			String.raw`(?:\/\*\*((?:(?!\/\*\*)(?!\*\/)[\s\S])*)\*\/\s*)?export\s+(?:(?:async\s+)?function\s*\*?\s*${name}\s*\(([^)]*)\)|const\s+${name}\s*=\s*(?:async\s*)?(?:\(((?:[^()]|\([^()]*\))*)\)\s*=>|(\w+)\s*=>|(function)\b|(styled)\()?|class\s+${name}\b(?:\s+extends\s+(\w+))?)`,
		),
	);

	if (!match) return null;

	const [
		declaration,
		jsdoc,
		functionParameters,
		arrowParameters,
		arrowParameter,
		functionExpression,
		styledClass,
		base,
	] = match;
	const declared = declaration.slice(declaration.lastIndexOf('export'));
	let kind = 'const';

	if (
		/^export\s+(async\s+)?function/.test(declared) ||
		arrowParameters !== undefined ||
		arrowParameter ||
		functionExpression
	)
		kind = 'function';
	else if (/^export\s+class/.test(declared) || styledClass) kind = 'class';

	return {
		kind,
		extends: base ?? null,
		documented: Boolean(jsdoc?.trim()),
		async: /\basync\b/.test(declared),
		...parseJSDocBlock(jsdoc ?? ''),
		sourceParameters: sourceParameters(functionParameters ?? arrowParameters ?? arrowParameter ?? ''),
	};
}

/**
 * Extracts property information from JSDoc comments and getter methods.
 * @param {string} content - File content to parse
 * @returns {Array} Array of property objects with name, type, description, and access info
 */
function extractProperties(content) {
	const properties = [];

	// Extract getter properties - same anti-span pattern as extractMethods.
	const getterMatches = [
		...content.matchAll(/\/\*\*((?:(?!\/\*\*)[\s\S])*?)\*\/[ \t]*\n[ \t]*get\s+(\w+)\s*\(\)\s*\{/g),
	];

	getterMatches.forEach(match => {
		const [, jsdoc, name] = match;

		const descMatch = jsdoc.match(/^\s*\*\s*(.+?)(?=\s*^\s*\*\s*@|\s*$)/ms);
		const description = descMatch
			? descMatch[1]
					.split('\n')
					.map(line => line.replace(/^\s*\*\s?/, ''))
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim()
			: '';

		const returnMatch = jsdoc.match(/^\s*\*\s*@returns?\s+\{((?:[^{}]|\{[^{}]*\})+)\}/m);
		const type = returnMatch ? returnMatch[1].trim() : 'unknown';

		properties.push({
			name,
			type,
			description,
			access: 'readonly',
		});
	});

	// Extract documented properties (this.property assignments with JSDoc)
	const propMatches = [...content.matchAll(/\/\*\*((?:(?!\/\*\*)[\s\S])*?)\*\/[ \t]*\n[ \t]*(?:this\.)?(\w+)\s*=/g)];

	propMatches.forEach(match => {
		const [, jsdoc, name] = match;

		const descMatch = jsdoc.match(/^\s*\*\s*(.+?)(?=\s*^\s*\*\s*@|\s*$)/ms);
		const description = descMatch
			? descMatch[1]
					.split('\n')
					.map(line => line.replace(/^\s*\*\s?/, ''))
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim()
			: '';

		const typeMatch = jsdoc.match(/^\s*\*\s*@type\s+{([^}]+)}/m);
		const type = typeMatch ? typeMatch[1].trim() : 'unknown';

		properties.push({
			name,
			type,
			description,
			access: 'read-write',
		});
	});

	return properties;
}

/**
 * Extracts event information from emit() calls and JSDoc `@fires` tags.
 * @param {string} content - File content to parse
 * @returns {Array} Array of event objects with name and description
 */
function extractEvents(content) {
	const events = [];

	// Extract from emit() calls
	const emitMatches = [...content.matchAll(/\.emit\s*\(\s*['"`]([^'"`]+)['"`]/g)];

	emitMatches.forEach(match => {
		const [, eventName] = match;
		events.push({
			name: eventName,
			description: `Emitted when ${eventName} occurs`,
		});
	});

	// Extract from dispatchEvent calls
	const dispatchMatches = [...content.matchAll(/\.dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]/g)];

	dispatchMatches.forEach(match => {
		const [, eventName] = match;
		if (!events.find(e => e.name === eventName)) {
			events.push({
				name: eventName,
				description: `Custom event: ${eventName}`,
			});
		}
	});

	return events;
}

/**
 * Extracts import statements to determine component dependencies.
 * @param {string} content - File content to parse
 * @returns {Array} Array of import objects with module and imported items
 */
function extractImports(content) {
	const importMatches = [
		...content.matchAll(/^import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"`]([^'"`]+)['"`];/gm),
	];

	return importMatches
		.filter(([, , , , module]) => /^\.\.\//.test(module)) // external relative only, not same-dir ./
		.map(match => {
			const [, namedImports, namespaceImport, defaultImport, module] = match;

			let imports = [];

			if (namedImports) {
				imports = namedImports.split(',').map(imp => imp.trim());
			} else if (namespaceImport) {
				imports = [`* as ${namespaceImport}`];
			} else if (defaultImport) {
				imports = [defaultImport];
			}

			return {
				module: module.replace(/^(\.\.?\/)+/, ''),
				imports,
			};
		});
}

/**
 * Extracts example code from JSDoc `@example` tags.
 * @param {string} content - File content to parse
 * @returns {Array} Array of example objects with code and optional description
 */
function extractExamples(content) {
	const examples = [];

	// Find all JSDoc blocks with @example tags
	const jsdocBlocks = [...content.matchAll(/\/\*\*\s*\n([\s\S]*?)\*\//g)];

	jsdocBlocks.forEach(([, jsdoc]) => {
		const exampleMatches = [...jsdoc.matchAll(/^\s*\*\s*@example\s*\n([\s\S]*?)(?=^\s*\*\s*@|\s*$)/gms)];

		exampleMatches.forEach(([, exampleContent]) => {
			const code = exampleContent
				.split('\n')
				.map(line => line.replace(/^\s*\*\s?/, ''))
				.join('\n')
				.trim();

			if (code) {
				examples.push({
					code,
					description: '', // Could extract description if needed
				});
			}
		});
	});

	return examples;
}

// CLI usage
if (import.meta.main) {
	const filePath = process.argv[2];

	if (!filePath) {
		console.error('Usage: bun extractJSDoc.js <path-to-js-file>');
		process.exit(1);
	}

	const result = extractJSDoc(filePath);
	console.log(JSON.stringify(result, null, 2));
}
