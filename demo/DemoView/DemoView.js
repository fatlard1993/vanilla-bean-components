import { GET } from '@vanilla-bean/hypertether';
import * as vbc from '../..';
import { Elem, Link, View, styled, Label, Button, Icon, Input, removeExcessIndentation } from '../..';

const extractBuildBody = source =>
	removeExcessIndentation(
		source
			.replace(/^import[^\n]*\n/gm, '')
			.replace(/export\s+default\s+class[^{]+\{/, '')
			.replace(/^\s*(?:async\s+)?build\s*\(\s*\)\s*\{/, '')
			.replace(/\s*\}\s*\}\s*$/, ''),
	).trim();

const INTERNAL_CLASS_NAMES = new Set(['StyledComponent', 'ConfiguredComponent']);

const StyledLabel = styled(
	Label,
	() => `
		display: block;
		width: auto;
		margin: 0 1% 9px;

		label {
			display: block;
		}
	`,
);

export class DemoView extends View {
	get demoWrapper() {
		if (!this._demoWrapper) {
			this._demoWrapper = new Label({
				variant: 'collapsible',
				label: 'Demo',
				style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
				appendTo: this,
			});
		}

		return this._demoWrapper;
	}

	render() {
		this._demoWrapper = null;
		this._chromeBuilt = false;
		this.elem.style.overflowY = 'auto';
		this.elem.style.overflowX = 'hidden';
		this.elem.style.minHeight = '0';

		super.render();
		this._buildChrome();
	}

	async _buildChrome() {
		if (!this.component || this._chromeBuilt) return;
		this._chromeBuilt = true;

		if (this.component.elem.parentElement !== document.body) this.demoWrapper.append(this.component);

		const componentName = this.component.constructor.name.replace(/\d$/, '');

		const componentAncestors = (this.component.ancestry?.() || []).filter(
			({ constructor: { name } }) => name !== this.component.constructor.name && !INTERNAL_CLASS_NAMES.has(name),
		);

		const [readme, demoSource, depsData, lld] = await Promise.all([
			GET(`components/${componentName}/README.md`),
			GET(`components/${componentName}/demo.js`),
			GET(`components/${componentName}/dependencies.json`),
			GET(`components/${componentName}/${componentName}.lld.md`),
		]);

		if (demoSource.response.ok) {
			const keys = Object.keys(vbc);
			const values = Object.values(vbc);

			const editor = new Input({
				tag: 'textarea',
				syntaxHighlighting: true,
				language: 'javascript',
				value: extractBuildBody(demoSource.body),
				style: { minHeight: '120px', maxHeight: '50vh', width: '100%', resize: 'vertical' },
			});

			const run = async () => {
				const oldComponent = this.component;
				try {
					await new Function(...keys, `return (async()=>{ ${editor.elem.value} })()`).call(this, ...values);
					if (this.component !== oldComponent) {
						oldComponent?.elem?.remove();
						oldComponent?.processCleanup?.();
						this.demoWrapper.append(this.component);
					}
				} catch (e) {
					this._liveError?.elem?.remove();
					this._liveError = new vbc.Component({
						tag: 'pre',
						textContent: `${e.name}: ${e.message}`,
						style: { color: '#f55', padding: '8px 12px', fontSize: '12px' },
						appendTo: this.demoMetadata,
					});
				}
			};

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
					label: 'Demo Code',
					style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
					appendTo: this,
				},
				editor,
				new Button({ textContent: 'Run', icon: 'play', style: { marginTop: '6px' }, onPointerPress: run }),
			);
		}

		this.demoMetadata = new Label({
			variant: 'collapsible',
			label: 'Details',
			style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
			appendTo: this,
		});

		if (componentAncestors.length > 0) {
			new StyledLabel(
				{ label: 'Ancestors', appendTo: this.demoMetadata },
				componentAncestors.reverse().flatMap(({ constructor: { name } }, index) => [
					new Link({
						textContent: name.replace(/\d$/, ''),
						variant: 'button',
						style: { marginRight: '6px' },
						href:
							{
								EventTarget: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget',
								Elem: '#/documentation/Elem',
								Component: '#/documentation/Component',
							}[name] || `#/${name.replace(/\d$/, '')}`,
					}),
					index === componentAncestors.length - 1
						? undefined
						: new Icon({ icon: 'arrow-right', style: { display: 'inline', marginRight: '6px' } }),
				]),
			);
		}

		if (depsData.response.ok && depsData.body?.length > 0) {
			new StyledLabel(
				{ label: 'Dependencies', appendTo: this.demoMetadata },
				depsData.body.map(({ name, route }) =>
					route
						? new Link({ textContent: name, variant: 'button', href: route, style: { marginRight: '6px' } })
						: new Elem({ tag: 'code', textContent: name, style: { marginRight: '6px' } }),
				),
			);
		}

		if (readme.response.ok) {
			new StyledLabel(
				{ label: 'README', appendTo: this.demoMetadata },
				new Elem({ style: { overflow: 'auto' }, innerHTML: readme.body }),
			);
		}

		if (lld.response.ok) {
			new Label(
				{
					variant: 'collapsible',
					collapsed: true,
					label: 'LLD',
					style: { margin: '2% 4%', width: 'calc(100% - 8%)', flexShrink: 0 },
					appendTo: this,
				},
				new Elem({ style: { overflow: 'auto', padding: '4%' }, innerHTML: lld.body }),
			);
		}
	}
}
