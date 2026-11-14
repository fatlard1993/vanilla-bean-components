import { afterAll, describe, expect, test } from 'bun:test';
import { RuleTester } from 'eslint';

import plugin from './usageRules.cjs';

RuleTester.describe = describe;
RuleTester.it = test;
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 'latest', sourceType: 'module' } });

const cases = {
	'overlay.popover-close': {
		valid: ['const menu = new ContextMenu({}); menu.close();', 'const card = new Card({}); card.elem.remove();'],
		invalid: [
			'const dialog = new Dialog({}); dialog.elem.remove();',
			'const edit = new FormDialog({}); edit.elem.remove();',
			'class A { build() { this.sheet = new BottomSheet({}); } hide() { this.sheet.elem.remove(); } }',
			'const menu = new ContextMenu({}); menu.elem.remove();',
			'class A { build() { this.tip = new Tooltip({}); } hide() { this.tip.elem.remove(); } }',
		],
	},
	'overlay.emptystate-options': {
		valid: ["new EmptyState({ title: 'No games', message: 'Add one' });"],
		invalid: [{ code: "new EmptyState({ header: 'No games', body: 'Add one' });", errors: 2 }],
	},
	'action.icon-only-named': {
		valid: [
			"new Button({ icon: 'plus', tooltip: 'Add a game' });",
			"new Button({ icon: 'plus', textContent: 'Add' });",
			"new Button({ icon: 'plus', attributes: { 'aria-label': 'Add' } });",
			"new Button({ icon: 'plus', ...options });",
			"new Button({ icon: 'plus', attributes });",
		],
		invalid: ["new Button({ icon: 'plus' });", "new Button({ icon: 'plus', attributes: { id: 'add' } });"],
	},
	'action.icon-option': {
		valid: ["new Button({ icon: 'plus', textContent: 'Add' });", "new Link({ append: new Elem({ tag: 'span' }) });"],
		invalid: [
			"new Button({ append: new Icon({ icon: 'plus' }) });",
			"new Link({ append: [new Elem({ tag: 'i' }), 'Docs'] });",
		],
	},
	'action.toggle-pressed': {
		valid: [
			'const mute = new Button({}); mute.setOption("pressed", true);',
			"const link = new Link({}); link.toggleClass('active');",
			"elem.toggleClass('active');",
		],
		invalid: [
			"const mute = new Button({}); mute.toggleClass('active', muted);",
			"class A { build() { this.mute = new Button({}); } sync() { this.mute.addClass('selected'); } }",
		],
	},
	'action.disabled-option': {
		valid: ['save.options.disabled = true;', 'input.disabled = true;'],
		invalid: ['save.elem.disabled = true;', 'this.save.elem.disabled = busy;'],
	},
	'action.no-handbuilt-button': {
		valid: [
			"const Big = styled(Button, '', { tag: 'button' });",
			"new Button({ textContent: 'Go' });",
			"new Elem({ tag: 'span' });",
		],
		invalid: [
			"document.createElement('button');",
			"const Tile = styled(Card, '', { tag: 'button' });",
			"new Component({ tag: 'button' });",
			"new Elem({ tag: 'button', textContent: 'Go' });",
		],
	},
	'layout.route-paths': {
		valid: [
			"new Router({ views: { '/': Home, '/fields': Fields, '/fields/:fieldId': Field } });",
			"const routes = { '/supply-orders': Orders }; new Router({ views: routes });",
		],
		invalid: [
			"new Router({ views: { '/Fields': Fields } });",
			{
				code: "const routes = { '/Leases': Leases, '/supply_orders': Orders }; new Router({ views: routes });",
				errors: 2,
			},
		],
	},
	'form.read-options-value': {
		valid: [
			'const name = new Input({}); name.options.value;',
			'const box = new Elem({}); box.elem.value;',
			'const show = view => { view.elem.value = 3; };',
		],
		invalid: [
			"const Editor = styled(Input, ''); class A { build() { this.editor = new Editor({}); } get value() { return this.editor.elem.value; } }",
			'const name = new Input({}); send(name.elem.value);',
			'this.password.elem.value;',
			"const kind = new Select({}); kind.elem.value = 'a';",
		],
	},
	'form.placeholder-not-label': {
		valid: [
			"const source = new Input({ placeholder: 'A link' }); new Label({ label: 'Source', for: source });",
			"class A { build() { this.name = new Input({ placeholder: 'Name' }); this.row = new Label({ label: 'New' }, this.name); } }",
			"const f = new Input({ placeholder: 'x' }); new Label('Name', f);",
			"new Input({ placeholder: 'Search', attributes: { 'aria-label': 'Search games' } });",
			"new Label('Name', new Input({ placeholder: 'e.g. Home Farm' }));",
			"new Label({ label: 'Name', append: [new Input({ placeholder: 'e.g. Home Farm' })] });",
			"new Input({ placeholder: 'Search', ...field });",
		],
		invalid: [
			"const f = new Input({ placeholder: 'x' }); new Label('Name', other);",
			"new Input({ placeholder: 'Search' });",
			"new Select({ attributes: { placeholder: 'Pick one' }, options: [] });",
		],
	},
	'form.no-raw-fields': {
		valid: [
			"const Editor = styled(Input, ''); new Editor({ tag: 'textarea' });",
			"class Big extends Input {} new Big({ tag: 'textarea' });",
			"new Input({ tag: 'textarea' });",
			"new Select({ options: [{ label: 'Fields', options: ['A'] }] });",
			"document.createElement('canvas');",
		],
		invalid: [
			"document.createElement('option');",
			"new Elem({ tag: 'select' });",
			"new Component({ tag: 'textarea' });",
			"new Input({ tag: 'select' });",
		],
	},
	'structure.sectionlabel-margin': {
		valid: [
			"new SectionLabel({ textContent: 'Members' });",
			"const box = new Elem({}); box.elem.style.marginTop = '0';",
		],
		invalid: [
			"new SectionLabel({ textContent: 'Members', style: { marginTop: 0 } });",
			"const heading = new SectionLabel({}); heading.elem.style.marginTop = '0';",
		],
	},
	'structure.card-accent': {
		valid: ["new Card({ accent: 'danger' });", "new Card({ style: { boxShadow: '0 1px 2px black' } });"],
		invalid: [
			"new Card({ style: { borderLeft: '3px solid red' } });",
			"new Card({ style: { boxShadow: 'inset 3px 0 red' } });",
		],
	},
	'structure.list-nostyle': {
		valid: [
			'new List({ noStyle: true });',
			"const css = { listStyle: 'disc' };",
			'const styles = `& summary { list-style: none; cursor: pointer; }`;',
		],
		invalid: [
			"const css = { listStyle: 'none' };",
			'const styles = `ul { list-style: none; }`;',
			{ code: 'const styles = `\n\t& .notes { color: red; }\n\t& ul.steps {\n\t\tlist-style: none;\n\t}\n`;', line: 4 },
		],
	},
};

describe('usage rules', () => {
	test('every rule has cases, and every case names a rule', () => {
		const ruleIds = Object.keys(plugin.rules).sort();

		if (JSON.stringify(ruleIds) !== JSON.stringify(Object.keys(cases).sort())) {
			throw new Error(`rules ${ruleIds} and cases ${Object.keys(cases)} differ`);
		}
	});

	for (const [id, { valid, invalid }] of Object.entries(cases)) {
		ruleTester.run(id, plugin.rules[id], {
			valid,
			invalid: invalid.map(item => {
				const { code, errors = 1, line } = typeof item === 'string' ? { code: item } : item;

				return { code, errors: Array.from({ length: errors }, () => ({ messageId: id, ...(line && { line }) })) };
			}),
		});
	}
});

test("the doc's lint rules are the plugin's rules", async () => {
	const doc = await Bun.file(`${import.meta.dir}/../docs/USAGE_RULES.md`).text();
	const lintIds = [...doc.matchAll(/^\*\*([a-z]+\.[a-z-]+)\*\* · [^:]*· lint:/gm)].map(([, id]) => id).sort();

	expect(lintIds).toEqual(Object.keys(plugin.rules).sort());
});
