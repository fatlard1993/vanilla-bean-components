import { marked } from 'marked';

import colors from '../../theme/colors';

// Mirrors lldtdd's own parser.ts normalization exactly (arrow -> unicode arrow, applied to the
// whole file before any line-level parsing) so a claim's rendered text matches a CaseResult's
// `description` verbatim - no fuzzy matching needed.
const normalizeArrows = text => text.replace(/ *-> */g, ' → ');

const ICONS = {
	pass: { icon: 'check', color: () => colors.green, label: 'passing' },
	fail: { icon: 'xmark', color: () => colors.red, label: 'failing' },
	error: { icon: 'xmark', color: () => colors.red, label: 'failing' },
	skip: { icon: 'minus', color: () => colors.gray, label: 'pending (no derivable test)' },
	'not-run': { icon: 'circle', color: () => colors.alpha(colors.gray, 0.5), label: 'not yet run' },
};

const statusIcon = status => {
	const { icon, color, label } = ICONS[status] ?? ICONS['not-run'];

	return `<span class="icon fa-support fa-${icon}" style="color:${color()};margin-right:6px" title="${label}" aria-hidden="true"></span>`;
};

/**
 * Flattens a lldtdd RunResult's cases (and their perspectives) into a lookup keyed by the exact
 * claim text, so rendering can match a claim line to its result with a plain string lookup.
 * @param {Array<object>} [runResult] - `RunResult[]` as returned by lldtdd's `runFiles`
 * @returns {Map<string, {status: string, error?: string}>}
 */
export const resultsByDescription = runResult => {
	const map = new Map();
	if (!Array.isArray(runResult)) return map;

	const visit = cases => {
		for (const c of cases ?? []) {
			map.set(c.description, { status: c.status, error: c.error });
			visit(c.perspectives);
		}
	};

	for (const result of runResult) visit(result.cases);

	return map;
};

const renderItem = (text, results) => {
	const { status = 'not-run', error } = results?.get(text) ?? {};
	const errorHtml =
		error && status !== 'pass'
			? `<div style="color:${colors.red};font-size:0.85em;margin:2px 0 4px 22px;white-space:pre-wrap">${marked.parseInline(String(error))}</div>`
			: '';

	return `<li>${statusIcon(status)}${marked.parseInline(text)}${errorHtml}</li>`;
};

/**
 * Renders a raw `.lld.md` document's markdown, injecting a pass/fail/pending/not-run status
 * icon (and, for failures, the assertion's error text) onto every claim and perspective line.
 * Everything else (title, module pointer, prose, headings) renders exactly as plain markdown.
 * @param {string} rawText - raw contents of the `.lld.md` file
 * @param {Map<string, {status: string, error?: string}>} [results] - from `resultsByDescription`;
 *   omit (or pass an empty map) to render every claim as "not yet run"
 * @returns {string} HTML
 */
export const renderLLD = (rawText, results) => {
	const lines = normalizeArrows(rawText ?? '').split('\n');

	let html = '';
	let proseBuffer = [];
	let items = null; // top-level claim items while inside a bullet run: [{ text, perspectives }]

	const flushProse = () => {
		if (proseBuffer.length > 0) html += marked.parse(proseBuffer.join('\n'));
		proseBuffer = [];
	};

	const flushItems = () => {
		if (!items) return;
		html += '<ul>';
		for (const item of items) {
			html += renderItem(item.text, results);
			if (item.perspectives.length > 0) {
				html += '<ul>';
				for (const p of item.perspectives) html += renderItem(p, results);
				html += '</ul>';
			}
		}
		html += '</ul>';
		items = null;
	};

	for (const line of lines) {
		const trimmed = line.trim();

		if (/^\s{2,}-\s/.test(line) && items?.length) {
			items[items.length - 1].perspectives.push(trimmed.replace(/^-\s/, '').trim());
			continue;
		}

		if (trimmed.startsWith('- ')) {
			flushProse();
			items = items ?? [];
			items.push({ text: trimmed.slice(2).trim(), perspectives: [] });
			continue;
		}

		flushItems();
		proseBuffer.push(line);
	}

	flushItems();
	flushProse();

	return html;
};
