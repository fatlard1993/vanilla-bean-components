/* eslint-disable spellcheck/spell-checker */
import { Elem, Link, View, styled, GET, Label, Button, Form, Select, Icon } from '../..';
import DemoOptions from './DemoOptions';
import { DemoWrapper } from './DemoWrapper';

const StyledLabel = styled(
	Label,
	() => `
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
			this._demoWrapper = new DemoWrapper({ appendTo: this });

			this._demoWrapperVisibilityButton = new Button({
				icon: 'eye-slash',
				appendTo: this._demoWrapper,
				style: { position: 'absolute', top: '6px', right: '6px' },
				onPointerPress: () => {
					const isHidden = this._demoWrapper.hasClass('hidden');

					this._demoWrapper[isHidden ? 'removeClass' : 'addClass']('hidden');
					this._demoWrapperVisibilityButton.options.icon = isHidden ? 'eye-slash' : 'eye';
				},
			});
		}

		return this._demoWrapper;
	}

	render() {
		this._demoWrapper = null;
		this._chromeBuilt = false;

		super.render();
		this._buildChrome();
	}

	async _buildChrome() {
		if (!this.component || this._chromeBuilt) return;
		this._chromeBuilt = true;

		this.demoWrapper.prepend(this.component);

		this.demoMetadata = new Elem({
			appendTo: this,
			style: {
				display: 'flex',
				flexDirection: 'column',
				overflowY: 'auto',
				overflowX: 'hidden',
			},
		});

		const componentAncestors = (this.component.ancestry?.() || []).filter(
			({ constructor: { name } }) => name !== this.component.constructor.name && name !== 'StyledComponent',
		);

		const readme = await GET(`components/${this.component.constructor.name.replace(/\d$/, '')}/README.md`);

		if (readme.response.ok) {
			new StyledLabel(
				{ label: 'README', appendTo: this.demoMetadata },
				new Elem({ style: { overflow: 'auto' }, innerHTML: readme.body }),
			);
		}

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

		const resetForm = () => {
			this.newOptionForm.options.data.key = '';
			this.newOptionForm.options.data.type = 'string';
			this.newOptionForm.options.data.value = '';
		};

		this.newOptionForm = new Form(
			{
				appendTo: new Label({ style: { display: 'none' }, label: 'New Option' }),
				data: { key: '', type: 'string', value: '' },
				inputs: [
					{ key: 'key' },
					{ key: 'type', InputComponent: Select, options: ['string', 'JSON', 'boolean'] },
					{
						key: 'value',
						parse: value => {
							if (this.newOptionForm.options.data.type === 'string') return value;
							if (this.newOptionForm.options.data.type === 'JSON') return JSON.parse(value);
							if (this.newOptionForm.options.data.type === 'boolean') return value.toLowerCase() === 'true';
						},
					},
				],
			},
			new Button({
				icon: 'close',
				style: { position: 'absolute', top: '-12px', right: '24px' },
				onPointerPress: () => {
					this.newOptionForm.parent.elem.style.display = 'none';
					this.addOptionButton.elem.style.display = 'block';

					resetForm();
				},
			}),
			new Button({
				icon: 'save',
				style: { position: 'absolute', top: '-12px', right: '-12px' },
				onPointerPress: () => {
					this.newOptionForm.parent.elem.style.display = 'none';
					this.addOptionButton.elem.style.display = 'block';

					this.component.options[this.newOptionForm.options.data.key] = this.newOptionForm.options.data.value;

					resetForm();
				},
			}),
		);

		this.addOptionButton = new Button({
			content: 'Add Option',
			icon: 'add',
			onPointerPress: () => {
				this.newOptionForm.parent.elem.style.display = 'block';
				this.addOptionButton.elem.style.display = 'none';
			},
		});

		new StyledLabel(
			{ label: 'Options', appendTo: this.demoMetadata },
			this.addOptionButton,
			this.newOptionForm.parent,
			new DemoOptions({ component: this.component }),
		);
	}
}
