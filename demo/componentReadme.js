import { processTemplate } from '../devTools/processTemplate.js';

/**
 * The markdown the demo shows for a component: its hand-written README when it has one, followed by the reference
 * sections (Options, Methods, Events, …) the template extracts from its JSDoc, so neither is lost. With no README, the
 * template alone. Sections the JSDoc leaves empty are dropped.
 * @param {object} options - What to compose
 * @param {string} options.name - Component name, the folder under components/
 * @param {string} options.template - The README template (devTools/COMPONENT_README_TEMPLATE.md)
 * @param {string} [options.readme] - The component's own README.md, when it has one
 * @returns {string} Markdown, ready for parseMarkdown
 */
export const componentReadme = ({ name, template, readme }) => {
	const [description, ...sections] = processTemplate(
		template.replaceAll('{ComponentName}', name),
		`components/${name}`,
	).split(/^(?=## )/m);
	const filled = sections.filter(section => section.replace(/^## .*\n/, '').trim());

	if (!readme) return [description, ...filled].join('').trim();

	// A level down, under one heading of their own, so the README's own sections keep their place
	const reference = filled.map(section => section.replace(/^(#+) /gm, '#$1 ')).join('');
	const own = readme.replace(/^#[^\n]*\n+/, '').trimEnd();

	return reference ? `${own}\n\n## Reference\n\n${reference.trim()}` : own;
};
