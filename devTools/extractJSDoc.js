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
 * Extracts constructor options from JSDoc @param tags.
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

	return paramMatches
		.filter(match => (match[3] && match[3].includes('options')) || match[2].includes('options.'))
		.map(match => {
			const [, type, fullParam, name, defaultValue, description] = match;
			const optional = fullParam.startsWith('[') && fullParam.endsWith(']');

			return {
				name: name.replace('options.', ''),
				type: type.trim(),
				description: description.trim().replace(/\s+/g, ' '),
				optional,
				default: defaultValue || null,
			};
		});
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

	// Now search for JSDoc comments within the class body only
	const matches = [...classBody.matchAll(/\/\*\*\s*\n([\s\S]*?)\*\/\s*(?!constructor)(?!_\w+)(\w+)\s*\([^)]*\)\s*{/g)];

	return matches.map(match => {
		const [, jsdoc, name] = match;

		// Extract description
		const descMatch = jsdoc.match(/^\s*\*\s*(.+?)(?=\s*^\s*\*\s*@|\s*$)/ms);
		const description = descMatch
			? descMatch[1]
					.split('\n')
					.map(line => line.replace(/^\s*\*\s?/, ''))
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim()
			: '';

		// Extract parameters
		const paramMatches = [
			...jsdoc.matchAll(
				/^\s*\*\s*@param\s+{([^}]+)}\s+(\[?(\w+)(?:=([^\]]+))?\]?)\s*-\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$)/gms,
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

		// Extract return information
		const returnMatch = jsdoc.match(/^\s*\*\s*@returns?\s+{([^}]+)}\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$)/ms);
		const returnInfo = returnMatch
			? {
					type: returnMatch[1].trim(),
					description: returnMatch[2].trim().replace(/\s+/g, ' '),
				}
			: null;

		return {
			name,
			description,
			parameters,
			returns: returnInfo,
		};
	});
}

/**
 * Extracts property information from JSDoc comments and getter methods.
 * @param {string} content - File content to parse
 * @returns {Array} Array of property objects with name, type, description, and access info
 */
function extractProperties(content) {
	const properties = [];

	// Extract getter properties
	const getterMatches = [...content.matchAll(/\/\*\*\s*\n([\s\S]*?)\*\/\s*get\s+(\w+)\s*\(\)\s*{/g)];

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

		const returnMatch = jsdoc.match(/^\s*\*\s*@returns?\s+{([^}]+)}\s*(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$)/ms);
		const type = returnMatch ? returnMatch[1].trim() : 'unknown';

		properties.push({
			name,
			type,
			description,
			access: 'readonly',
		});
	});

	// Extract documented properties (this.property assignments with JSDoc)
	const propMatches = [...content.matchAll(/\/\*\*\s*\n([\s\S]*?)\*\/\s*(?:this\.)?(\w+)\s*=/g)];

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
 * Extracts event information from emit() calls and JSDoc @fires tags.
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
				module: module.replace(/^\.+\//, ''), // Remove relative path indicators
				imports,
			};
		})
		.filter(imp => !imp.module.includes('node_modules') && !imp.module.startsWith('.'));
}

/**
 * Extracts example code from JSDoc @example tags.
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
