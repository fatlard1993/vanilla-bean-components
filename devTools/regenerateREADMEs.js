/* eslint-disable spellcheck/spell-checker */
import fs from 'fs';
import path from 'path';

const componentsDir = 'components';
const templatePath = 'devTools/COMPONENT_README_TEMPLATE.md';

// Read the template
const template = fs.readFileSync(templatePath, 'utf8');

// Get all component directories
const componentDirs = fs
	.readdirSync(componentsDir, { withFileTypes: true })
	.filter(entry => entry.isDirectory())
	.map(entry => entry.name);

console.log(`Found ${componentDirs.length} components to update:`);

for (const componentName of componentDirs) {
	const componentDir = path.join(componentsDir, componentName);
	const mdPath = path.join(componentDir, 'README.md');
	const componentPath = path.join(componentDir, `${componentName}.js`);

	// Check if component file exists
	if (!fs.existsSync(componentPath)) {
		console.log(`⚠️  Skipping ${componentName} - no ${componentName}.js file found`);
		continue;
	}

	// Generate content from template
	let mdContent = template
		.replaceAll('{ComponentName}', componentName)
		.replaceAll('{Component description here}', `{${componentName} description here}`);

	// Check if README already exists and preserve description if present
	if (fs.existsSync(mdPath)) {
		const existingContent = fs.readFileSync(mdPath, 'utf8');
		const descriptionMatch = existingContent.match(/^# \w+\n\n([^#]+)(?=\n## Usage|\n##|$)/);
		if (descriptionMatch && !descriptionMatch[1].includes('{') && descriptionMatch[1].trim()) {
			mdContent = mdContent.replace(`{${componentName} description here}`, descriptionMatch[1].trim());
		}
	}

	// Write the updated file
	fs.writeFileSync(mdPath, mdContent);
	console.log(`✅ Updated ${componentName}/README.md`);
}

console.log('\n🎉 README regeneration complete!');
console.log('\nNext steps:');
console.log('1. Review and update component descriptions where needed');
console.log('2. Add JSDoc comments to components for better method extraction');
console.log('3. Run `bun run format` to format the files');
