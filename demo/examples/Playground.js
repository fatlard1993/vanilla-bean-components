import { Component, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Playground.js.asText';

const StyledLabel = styled.Label`
	display: block;
	width: auto;
`;

const CodeInput = styled.Input(
	() => `
		min-width: 400px;
		min-height: 100px;
	`,
	{ tag: 'textarea', syntaxHighlighting: true },
);

export class Playground extends (styled.Component`
	display: flex;
`) {
	constructor(options = {}) {
		const database = JSON.parse(localStorage.getItem('playground_db')) || {
			html: '<div>wow!</div>',
			js: 'console.log("Hello World");',
			css: 'div { color: red; }',
			width: '400px',
		};

		super({
			...database,
			...options,
		});
	}

	render() {
		this.left = new Component({ appendTo: this });
		this.right = new Component({
			style: { display: 'flex', flex: 1 },
			appendTo: this,
		});

		this.output = new Component({
			tag: 'iframe',
			style: { flex: 1, margin: '0 12px 12px' },
			appendTo: this.right,
		});

		this.html = new CodeInput({
			value: this.options.html,
			language: 'html',
			onChange: ({ value }) => (this.options.html = value),
			onPointerDown: () => {
				this.html.observer = new ResizeObserver(() => {
					if (!this.html.elem.offsetWidth) return;

					this.options.width = this.js.elem.style.width = this.css.elem.style.width = `${this.html.elem.offsetWidth}px`;
				});
				this.html.observer.observe(this.html.elem);
			},
			onPointerUp: () => {
				this.html.observer.disconnect();
			},
			appendTo: new StyledLabel({ label: 'HTML', appendTo: this.left }),
		});
		this.js = new CodeInput({
			value: this.options.js,
			language: 'javascript',
			onChange: ({ value }) => (this.options.js = value),
			onPointerDown: () => {
				this.js.observer = new ResizeObserver(() => {
					if (!this.js.elem.offsetWidth) return;

					this.options.width = this.html.elem.style.width = this.css.elem.style.width = `${this.js.elem.offsetWidth}px`;
				});
				this.js.observer.observe(this.js.elem);
			},
			onPointerUp: () => {
				this.js.observer.disconnect();
			},
			appendTo: new StyledLabel({ label: 'JS', appendTo: this.left }),
		});
		this.css = new CodeInput({
			value: this.options.css,
			language: 'css',
			onChange: ({ value }) => (this.options.css = value),
			onPointerDown: () => {
				this.css.observer = new ResizeObserver(() => {
					if (!this.css.elem.offsetWidth) return;

					this.options.width = this.html.elem.style.width = this.js.elem.style.width = `${this.css.elem.offsetWidth}px`;
				});
				this.css.observer.observe(this.css.elem);
			},
			onPointerUp: () => {
				this.css.observer.disconnect();
			},
			appendTo: new StyledLabel({ label: 'CSS', appendTo: this.left }),
		});

		this.html.elem.style.width = this.js.elem.style.width = this.css.elem.style.width = this.options.width;

		super.render();
	}

	_setOption(key, value) {
		if (key === 'html' || key === 'js' || key === 'css') {
			this.updateOutput({ html: this.options.html, js: this.options.js, css: this.options.css, [key]: value });
		} else if (key === 'width')
			localStorage.setItem(
				'playground_db',
				JSON.stringify({ html: this.options.html, js: this.options.js, css: this.options.css, [key]: value }),
			);
		else super._setOption(key, value);
	}

	updateOutput({ html, js, css }) {
		localStorage.setItem('playground_db', JSON.stringify({ html, js, css }));

		this.output.elem.srcdoc = `
			<html>
				${html}
				<style>${css}</style>
				<script>${js}</script>
			</html>
    `;
	}
}

export default class Example extends ExampleView {
	render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Playground({ appendTo: this.demoWrapper });
	}
}
