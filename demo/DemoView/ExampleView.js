import * as vbc from '../..';
import { Button, Input, Label, removeExcessIndentation } from '../..';
import DemoView from '.';

const toEditableCode = fullCode => {
	const noImports = fullCode.replace(/^import[\s\S]*?;[ \t]*\n/gm, '');
	const exampleMatch = noImports.match(/export\s+default\s+class\s+Example\s+extends\s+\w+[\s\S]*$/m);
	if (!exampleMatch) return removeExcessIndentation(noImports).trim();

	const helpers = noImports.slice(0, exampleMatch.index).trimEnd();
	const buildBody = removeExcessIndentation(
		exampleMatch[0]
			.replace(/export\s+default\s+class\s+Example\s+extends\s+\w+\s*\{\s*(?:async\s+)?build\s*\(\s*\)\s*\{/, '')
			.replace(/\s*this\.options\.exampleCode\s*=[^\n]*\n/, '\n')
			.replace(/\s*\}\s*\}\s*$/, ''),
	).trim();

	return helpers ? `${helpers}\n\n${buildBody}` : buildBody;
};

export default class ExampleView extends DemoView {
	// demoWrapper always returns _runOutput so:
	// - example build() content lands directly in _runOutput (not the Label)
	// - async .content() calls (e.g. Blog) also target _runOutput
	// - no migration or ctx proxy needed in the handler
	get demoWrapper() {
		if (!this._demoWrapper) {
			this.elem.style.overflowY = 'auto';
			this.elem.style.overflowX = 'hidden';
			this.elem.style.minHeight = '0';
			this._demoWrapper = new Label({
				variant: 'collapsible',
				label: 'Demo',
				style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
				appendTo: this,
			});
			this._runOutput = new vbc.Component({ appendTo: this._demoWrapper });
		}
		return this._runOutput;
	}

	static handlers = {
		exampleCode(code) {
			if (!code) return;

			const keys = Object.keys(vbc);
			const values = Object.values(vbc);

			const run = () => {
				this._runOutput.empty();
				this._errorDisplay?.destroy?.();
				this._errorDisplay = null;

				try {
					const fn = new Function(...keys, `return (async()=>{ ${editor.elem.value} })()`);
					fn.call(this, ...values).catch(e => {
						this._errorDisplay = new vbc.Component({
							tag: 'pre',
							textContent: `${e.name}: ${e.message}`,
							style: { color: '#f55', padding: '8px 12px', fontSize: '12px', flexShrink: 0 },
							appendTo: this,
						});
					});
				} catch (e) {
					this._errorDisplay = new vbc.Component({
						tag: 'pre',
						textContent: `${e.name}: ${e.message}`,
						style: { color: '#f55', padding: '8px 12px', fontSize: '12px', flexShrink: 0 },
						appendTo: this,
					});
				}
			};

			const editor = new Input({
				tag: 'textarea',
				syntaxHighlighting: true,
				language: 'javascript',
				value: toEditableCode(code),
				style: { minHeight: '180px', maxHeight: '70vh', width: '100%', resize: 'vertical' },
			});

			editor.on({
				targetEvent: 'keydown',
				callback: e => {
					if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
						e.preventDefault();
						run();
					}
				},
			});

			new Label(
				{
					variant: 'collapsible',
					collapsed: true,
					label: 'Example Code',
					style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
					appendTo: this,
				},
				editor,
				new Button({ textContent: 'Run', icon: 'play', style: { marginTop: '6px' }, onPointerPress: run }),
			);
		},
	};
}
