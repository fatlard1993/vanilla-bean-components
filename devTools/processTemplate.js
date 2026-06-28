import { readFileSync } from 'fs';
import { join } from 'path';
import { extractJSDoc } from './extractJSDoc.js';

const codeCell = str => {
	const escaped = (str || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\|/g, '&#124;');
	return `<code>${escaped}</code>`;
};

/**
 * Processes README templates by replacing extraction commands with JSDoc-derived content.
 * @param {string} templateContent - Template content with extraction commands
 * @param {string} componentPath - Path to component directory for resolving relative paths
 * @returns {string} Processed template with commands replaced by generated content
 */
export function processTemplate(templateContent, componentPath = '.') {
	// Replace extraction commands that start with known command words
	return templateContent.replace(/\[\[(extract-[\w-]+|import)\s+([^\]]+)\]\]/g, (match, command, args) => {
		try {
			return processCommand(`${command} ${args}`.trim(), componentPath);
		} catch (error) {
			console.warn(`Failed to process command "${command} ${args}":`, error.message);
			return match; // Return original if processing fails
		}
	});
}

/**
 * Processes individual template commands and returns generated markdown content.
 * @param {string} command - Command string (e.g., "extract-description Button.js")
 * @param {string} basePath - Base path for resolving file references
 * @returns {string} Generated markdown content for the command
 */
function processCommand(command, basePath) {
	const [action, ...args] = command.split(/\s+/);
	const fileName = args[0];

	if (!fileName) {
		throw new Error(`No filename provided for command: ${action}`);
	}

	const filePath = join(basePath, fileName);

	switch (action) {
		case 'extract-description':
			return extractDescriptionMarkdown(filePath);

		case 'extract-options':
			return extractOptionsMarkdown(filePath);

		case 'extract-methods':
			return extractMethodsMarkdown(filePath);

		case 'extract-properties':
			return extractPropertiesMarkdown(filePath);

		case 'extract-events':
			return extractEventsMarkdown(filePath);

		case 'extract-imports':
			return extractImportsMarkdown(filePath);

		case 'extract-examples':
			return extractExamplesMarkdown(filePath);

		case 'extract-enums':
			return extractEnumsMarkdown(filePath);

		case 'extract-custom-events':
			return extractCustomEventsMarkdown(filePath);

		case 'extract-design':
			return extractDesignMarkdown(filePath, basePath);

		case 'import':
			return importFileContent(filePath, args[1]); // args[1] might be regex pattern

		default:
			throw new Error(`Unknown extraction command: ${action}`);
	}
}

/**
 * Extracts and formats component description as markdown.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted description markdown
 */
function extractDescriptionMarkdown(filePath) {
	const { description } = extractJSDoc(filePath);

	if (!description) {
		return '*No description available.*';
	}

	return description;
}

/**
 * Extracts and formats component options as markdown table.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted options table markdown
 */
function extractOptionsMarkdown(filePath) {
	const { options } = extractJSDoc(filePath);

	if (!options.length) {
		return '';
	}

	let markdown = '| Option | Type | Default | Description |\n';
	markdown += '|--------|------|---------|-------------|\n';

	options.forEach(option => {
		const name = option.optional ? `[${option.name}]` : option.name;
		const type = codeCell(option.type);
		let defaultValue;
		if (option.default) defaultValue = codeCell(option.default);
		else if (option.optional) defaultValue = codeCell('undefined');
		else defaultValue = '*required*';
		const description = (option.description || '*No description*').replace(/\|/g, '&#124;');

		markdown += `| ${name} | ${type} | ${defaultValue} | ${description} |\n`;
	});

	return markdown;
}

/**
 * Extracts and formats component methods as markdown sections.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted methods markdown
 */
function extractMethodsMarkdown(filePath) {
	const { methods } = extractJSDoc(filePath);

	if (!methods.length) {
		return '';
	}

	let markdown = '';

	methods.forEach((method, index) => {
		if (index > 0) markdown += '\n';

		// Method signature
		const params = method.parameters
			.map(p => {
				const name = p.optional ? `[${p.name}]` : p.name;
				return p.default ? `${name}=${p.default}` : name;
			})
			.join(', ');

		markdown += `### \`${method.name}(${params})\`\n\n`;

		// Description
		if (method.description) {
			markdown += `${method.description}\n\n`;
		}

		// Parameters
		if (method.parameters.length > 0) {
			markdown += '**Parameters:**\n\n';
			method.parameters.forEach(param => {
				const name = param.optional ? `[${param.name}]` : param.name;
				markdown += `- \`${name}\` (\`${param.type}\`) - ${param.description}`;
				if (param.default) markdown += ` (default: \`${param.default}\`)`;
				markdown += '\n';
			});
			markdown += '\n';
		}

		// Returns
		if (method.returns) {
			markdown += `**Returns:** \`${method.returns.type}\` - ${method.returns.description}\n\n`;
		}
	});

	return markdown.trim();
}

/**
 * Extracts and formats component properties as markdown table.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted properties table markdown
 */
function extractPropertiesMarkdown(filePath) {
	const { properties } = extractJSDoc(filePath);

	if (!properties.length) {
		return '';
	}

	let markdown = '| Property | Type | Access | Description |\n';
	markdown += '|----------|------|--------|-------------|\n';

	properties.forEach(prop => {
		const access = prop.access === 'readonly' ? 'Read-only' : 'Read/Write';
		const description = (prop.description || '*No description*').replace(/\|/g, '&#124;');

		markdown += `| ${codeCell(prop.name)} | ${codeCell(prop.type)} | ${access} | ${description} |\n`;
	});

	return markdown;
}

/**
 * Extracts and formats component events as markdown list.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted events markdown
 */
function extractEventsMarkdown(filePath) {
	const { events } = extractJSDoc(filePath);

	if (!events.length) {
		return '';
	}

	let markdown = '';

	events.forEach(event => {
		markdown += `- **\`${event.name}\`** - ${event.description}\n`;
	});

	return markdown;
}

/**
 * Extracts and formats component dependencies as markdown list.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted imports markdown
 */
const COMPONENT_DEMO_ROUTES = {
	EventTarget: 'https://developer.mozilla.org/docs/Web/API/EventTarget',
	Elem: '#/documentation/Elem',
	Component: '#/documentation/Component',
};

const MODULE_ROUTES = {
	utils: '#/documentation/utils',
	styled: '#/documentation/styled',
	'@vanilla-bean/oxject': '#/dependencies/oxject',
	'@ctrl/tinycolor': '#/dependencies/tinycolor',
};

/**
 * Extracts and formats component dependencies as markdown list.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted imports markdown
 */
function extractImportsMarkdown(filePath) {
	const { imports } = extractJSDoc(filePath);

	if (!imports.length) {
		return '';
	}

	const seen = new Set();
	let markdown = '';

	imports.forEach(imp => {
		const moduleRoot = imp.module.replace(/\/.*$/, '');
		const moduleRoute = MODULE_ROUTES[moduleRoot] || MODULE_ROUTES[imp.module];

		imp.imports.forEach(name => {
			if (seen.has(name)) return;
			seen.add(name);

			const route = moduleRoute ?? COMPONENT_DEMO_ROUTES[name] ?? (/^[A-Z]/.test(name) ? `#/${name}` : null);
			markdown += route ? `- [${name}](${route})\n` : `- \`${name}\`\n`;
		});
	});

	return markdown;
}

/**
 * Extracts and formats JSDoc examples as markdown code blocks.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted examples markdown
 */
function extractExamplesMarkdown(filePath) {
	const { examples } = extractJSDoc(filePath);

	if (!examples.length) {
		return '';
	}

	let markdown = '';

	examples.forEach((example, index) => {
		if (index > 0) markdown += '\n';

		if (example.description) {
			markdown += `${example.description}\n\n`;
		}

		markdown += '```js\n';
		markdown += example.code;
		markdown += '\n```\n';
	});

	return markdown.trim();
}

/**
 * Extracts usage examples from demo file.
 * @param {string} filePath - Path to component file
 * @param {string} basePath - Base path for resolving demo file
 * @returns {string} Formatted usage examples markdown
 */

/**
 * Extracts enum definitions from JSDoc comments.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted enums markdown
 */
function extractEnumsMarkdown(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');

		// Look for @enum JSDoc tags
		const enumMatches = [
			...content.matchAll(/\/\*\*\s*\n([\s\S]*?)@enum\s*{([^}]+)}\s*([\s\S]*?)\*\/\s*(const|let|var)\s+(\w+)/g),
		];

		if (!enumMatches.length) {
			return '';
		}

		let markdown = '';
		enumMatches.forEach(match => {
			const [, preEnum, enumType, , , enumName] = match;

			const description = preEnum.match(/^\s*\*\s*(.+?)(?=\s*^\s*\*\s*@|\s*$)/ms);
			const desc = description
				? description[1]
						.split('\n')
						.map(line => line.replace(/^\s*\*\s?/, ''))
						.join(' ')
						.trim()
				: '';

			markdown += `### \`${enumName}\` (\`${enumType}\`)\n\n`;
			if (desc) {
				markdown += `${desc}\n\n`;
			}
		});

		return markdown.trim();
	} catch {
		return '*Error extracting enums.*';
	}
}

/**
 * Extracts custom event definitions from JSDoc @fires tags and CustomEvent calls.
 * @param {string} filePath - Path to component file
 * @returns {string} Formatted custom events markdown
 */
function extractCustomEventsMarkdown(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');
		const customEvents = [];

		// Extract from @fires JSDoc tags
		const firesMatches = [...content.matchAll(/^\s*\*\s*@fires\s+(\w+)\s*-?\s*(.*)$/gm)];
		firesMatches.forEach(match => {
			const [, eventName, description] = match;
			customEvents.push({
				name: eventName,
				description: description || `Custom event: ${eventName}`,
			});
		});

		// Extract from dispatchEvent calls
		const dispatchMatches = [
			...content.matchAll(/dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*{([^}]*)}\s*\)/g),
		];
		dispatchMatches.forEach(match => {
			const [, eventName] = match;
			if (!customEvents.find(e => e.name === eventName)) {
				customEvents.push({
					name: eventName,
					description: `Custom event: ${eventName}`,
				});
			}
		});

		if (!customEvents.length) {
			return '';
		}

		let markdown = '';
		customEvents.forEach(event => {
			markdown += `- **\`${event.name}\`** - ${event.description}\n`;
		});

		return markdown.trim();
	} catch {
		return '*Error extracting custom events.*';
	}
}

/**
 * Extracts design information from DESIGN.md file or JSDoc @design tags.
 * @param {string} filePath - Path to component file
 * @param {string} basePath - Base path for resolving design file
 * @returns {string} Formatted design information markdown
 */
function extractDesignMarkdown(filePath, basePath) {
	try {
		// First try to find DESIGN.md file in component directory
		const designPath = join(basePath, 'DESIGN.md');
		try {
			const designContent = readFileSync(designPath, 'utf8');
			return designContent;
		} catch {
			// DESIGN.md doesn't exist, try extracting from JSDoc
		}

		// Extract from JSDoc @design tags
		const content = readFileSync(filePath, 'utf8');
		const designMatches = [...content.matchAll(/^\s*\*\s*@design\s+(.+?)(?=\s*^\s*\*\s*@|\s*^\s*\*\s*$)/gms)];

		if (!designMatches.length) {
			return '';
		}

		let markdown = '';
		designMatches.forEach(match => {
			const designText = match[1]
				.split('\n')
				.map(line => line.replace(/^\s*\*\s?/, ''))
				.join(' ')
				.trim();

			markdown += designText + '\n\n';
		});

		return markdown.trim();
	} catch {
		return '*Error extracting design information.*';
	}
}

/**
 * Imports file content with optional regex pattern matching.
 * @param {string} filePath - Path to file to import
 * @param {string} [pattern] - Optional regex pattern to extract specific content
 * @returns {string} File content or pattern-matched content
 */
function importFileContent(filePath, pattern) {
	try {
		const content = readFileSync(filePath, 'utf8');

		if (!pattern) {
			return content;
		}

		// Parse regex pattern from string
		const regexMatch = pattern.match(/^\/(.+)\/([gimsu]*)$/);
		if (regexMatch) {
			const [, regexPattern, flags] = regexMatch;
			const regex = new RegExp(regexPattern, flags);
			const match = content.match(regex);

			if (match) {
				return match[0];
			}
		}

		return content;
	} catch {
		return `*Error importing ${filePath}: file not found*`;
	}
}

// CLI usage
if (import.meta.main) {
	const templatePath = process.argv[2];
	const componentDir = process.argv[3] || '.';

	if (!templatePath) {
		console.error('Usage: bun processTemplate.js <template-file> [component-directory]');
		process.exit(1);
	}

	try {
		const templateContent = readFileSync(templatePath, 'utf8');
		const processedContent = processTemplate(templateContent, componentDir);
		console.log(processedContent);
	} catch {
		console.error('Error processing template: template processing failed');
		process.exit(1);
	}
}
