import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';

import colors from './colors';

const tomorrowNightTheme = EditorView.theme(
	{
		'&': {
			color: colors.light(colors.gray).toString(),
			backgroundColor: colors.black.toString(),
		},

		'.cm-content': {
			caretColor: colors.white.toString(),
		},

		'.cm-cursor, .cm-dropCursor': { borderLeftColor: colors.white.toString() },
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
			backgroundColor: `${colors.blue.setAlpha(0.2)} !important`,
		},

		'.cm-panels': { backgroundColor: colors.black.toString(), color: colors.gray.toString() },
		'.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
		'.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

		'.cm-searchMatch': {
			outline: `1px solid ${colors.yellow}`,
			backgroundColor: 'transparent',
		},
		'.cm-searchMatch.cm-searchMatch-selected': {
			backgroundColor: colors.darkest(colors.gray).toString(),
		},

		'.cm-activeLine': { backgroundColor: colors.gray.setAlpha(0.1).toString() },
		'.cm-selectionMatch': {
			backgroundColor: colors.black.toString(),
			outline: `1px solid ${colors.green}`,
			borderRadius: '3px',
		},

		'&.cm-focused .cm-matchingBracket': {
			backgroundColor: colors.black.toString(),
			outline: `1px solid ${colors.green}`,
			borderRadius: '3px',
		},

		'&.cm-focused .cm-nonmatchingBracket': {
			color: colors.light(colors.red).toString(),
		},

		'.cm-gutters': {
			backgroundColor: colors.black.toString(),
			borderRight: `1px solid ${colors.darker(colors.gray)}`,
			color: colors.dark(colors.gray).toString(),
		},

		'.cm-gutterElement': {
			color: colors.gray.toString(),
		},

		'.cm-activeLineGutter': {
			backgroundColor: colors.gray.setAlpha(0.2).toString(),
			color: colors.lightest(colors.gray).toString(),
		},

		'.cm-foldPlaceholder': {
			backgroundColor: colors.black.toString(),
			color: colors.pink.toString(),
			border: 'none',
			outline: `1px solid ${colors.pink}`,
		},

		'.cm-tooltip': {
			border: 'none',
			backgroundColor: colors.darkest(colors.gray).toString(),
		},
		'.cm-tooltip .cm-tooltip-arrow:before': {
			borderTopColor: 'transparent',
			borderBottomColor: 'transparent',
		},
		'.cm-tooltip .cm-tooltip-arrow:after': {
			borderTopColor: colors.darkest(colors.gray).toString(),
			borderBottomColor: colors.darkest(colors.gray).toString(),
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				backgroundColor: colors.darkest(colors.gray).toString(),
				color: colors.gray.toString(),
			},
		},
	},
	{ dark: true },
);

const tomorrowNightHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: colors.light(colors.purple).toString() },
	{
		tag: [t.name, t.deleted, t.character, t.macroName],
		color: colors.light(colors.teal).toString(),
	},
	{ tag: [t.propertyName], color: colors.lightest(colors.gray).toString() },
	{ tag: [t.variableName], color: colors.lighter(colors.gray).toString() },
	{ tag: [t.function(t.variableName)], color: colors.light(colors.teal).toString() },
	{ tag: [t.labelName], color: colors.light(colors.purple).toString() },
	{
		tag: [t.color, t.constant(t.name), t.standard(t.name)],
		color: colors.yellow.toString(),
	},
	{ tag: [t.definition(t.name), t.separator], color: colors.lightest(colors.gray).toString() },
	{ tag: [t.brace], color: colors.lighter(colors.gray).toString() },
	{
		tag: [t.annotation],
		color: colors.light(colors.red).toString(),
	},
	{
		tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
		color: colors.light(colors.orange).toString(),
	},
	{
		tag: [t.typeName, t.className],
		color: colors.light(colors.yellow).toString(),
	},
	{
		tag: [t.operator, t.operatorKeyword],
		color: colors.blue.toString(),
	},
	{
		tag: [t.tagName],
		color: colors.orange.toString(),
	},
	{
		tag: [t.squareBracket],
		color: colors.lightest(colors.gray).toString(),
	},
	{
		tag: [t.angleBracket],
		color: colors.dark(colors.gray).toString(),
	},
	{
		tag: [t.attributeName],
		color: colors.lighter(colors.gray).toString(),
	},
	{
		tag: [t.regexp],
		color: colors.light(colors.red).toString(),
	},
	{
		tag: [t.quote],
		color: colors.green.toString(),
	},
	{ tag: [t.string], color: colors.light(colors.green).toString() },
	{
		tag: t.link,
		color: colors.light(colors.teal).toString(),
		textDecoration: 'underline',
		textUnderlinePosition: 'under',
	},
	{
		tag: [t.url, t.escape, t.special(t.string)],
		color: colors.yellow.toString(),
	},
	{ tag: [t.meta], color: colors.gray.toString() },
	{ tag: [t.comment], color: colors.gray.toString(), fontStyle: 'italic' },
	{ tag: t.monospace, color: colors.lighter(colors.gray).toString() },
	{ tag: t.strong, fontWeight: 'bold', color: colors.light(colors.red).toString() },
	{ tag: t.emphasis, fontStyle: 'italic', color: colors.light(colors.green).toString() },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.heading, fontWeight: 'bold', color: colors.yellow.toString() },
	{ tag: t.heading1, fontWeight: 'bold', color: colors.yellow.toString() },
	{
		tag: [t.heading2, t.heading3, t.heading4],
		fontWeight: 'bold',
		color: colors.yellow.toString(),
	},
	{
		tag: [t.heading5, t.heading6],
		color: colors.yellow.toString(),
	},
	{ tag: [t.special(t.variableName)], color: colors.light(colors.teal).toString() },
	{ tag: [t.atom], color: colors.light(colors.red).toString() },
	{ tag: [t.bool], color: colors.light(colors.orange).toString() },
	{
		tag: [t.processingInstruction, t.inserted],
		color: colors.light(colors.red).toString(),
	},
	{
		tag: [t.contentSeparator],
		color: colors.light(colors.teal).toString(),
	},
	{
		tag: t.invalid,
		color: colors.dark(colors.gray).toString(),
		borderBottom: `1px dotted ${colors.light(colors.red).toString()}`,
	},
]);

const tomorrowNight = [tomorrowNightTheme, syntaxHighlighting(tomorrowNightHighlightStyle)];

const themeConfig = new Compartment();

export default themeConfig.of(tomorrowNight);
