import TinyColor, { random as randomColor } from '@ctrl/tinycolor';

import { debounceCb, dom, styled } from '../../utils';
import DomElem from '../DomElem';
import Input from '../Input';
import TextInput from '../TextInput';

import { saturation, hue } from './svg';

const PickerArea = styled(
	DomElem,
	({ colors }) => `
		position: relative;
		width: 150px;
		height: 150px;
		margin: 0 auto;
		box-shadow: 0px 0px 0px 2px ${colors.darker(colors.grey)};

		* {
			pointer-events: none;
		}
	`,
);

const PickerIndicator = styled(
	DomElem,
	({ colors }) => `
		position: absolute;
		top: -6px;
		left: -4px;
		transform: translate3d(-4px, -4px, 0px);
		width: 5px;
		height: 5px;
		border: 2px solid ${colors.grey};
		border-radius: 4px;
		opacity: 0.5;
		background-color: ${colors.white};
	`,
);

const HueArea = styled(
	DomElem,
	({ colors }) => `
		position: relative;
		width: 150px;
		height: 30px;
		margin: 10px auto 0;
		box-shadow: 0px 0px 0px 2px ${colors.darker(colors.grey)};

		* {
			pointer-events: none;
		}
	`,
);

const HueIndicator = styled(
	DomElem,
	({ colors }) => `
		position: absolute;
		width: 10px;
		height: 100%;
		top: -4px;
		left: -4px;
		transform: translate3d(-8px, 0px, 0px);
		opacity: 0.6;
		border: 4px solid ${colors.grey};
		border-radius: 4px;
		background-color: ${colors.white};
	`,
);

export class ColorPicker extends Input {
	constructor({ styles = () => '', value: initialValue = '#666', onChange = () => {}, ...options } = {}) {
		super({
			styles: ({ colors, ...theme }) => `
				background-color: ${colors.light(colors.grey)};
				padding: 14px;
				border-radius: 5px;
				margin-bottom: 6px;
				text-indent: 0;

				${styles({ colors, ...theme })}
			`,
			tag: 'div',
			...options,
		});

		this.onChange = onChange;

		this.pickerArea = new PickerArea({
			innerHTML: saturation,
			appendTo: this.elem,
		});
		this.pickerIndicator = new PickerIndicator({
			appendTo: this.pickerArea,
		});

		this.hueArea = new HueArea({
			innerHTML: hue,
			appendTo: this.elem,
		});
		this.hueIndicator = new HueIndicator({
			appendTo: this.hueArea,
		});

		this.textInput = new TextInput({
			appendTo: this.label,
			value: initialValue,
			onChange: ({ value }) => this.set(value),
			onKeyUp: ({ target: { value } }) => debounceCb(() => this.set(value), 700),
		});

		this.set(initialValue, true);

		document.addEventListener('mousedown', this.onPointerDown.bind(this));
		document.addEventListener('touchstart', this.onPointerDown.bind(this));
	}

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = value;
	}

	set(userInput, triggerEvent) {
		if (!userInput) return;

		const color = userInput === 'random' ? randomColor() : new TinyColor(userInput);
		const hsv = color.toHsv();
		const rgbString = color.toRgbString();

		this.color = color;

		this.value = rgbString;
		this.textInput.elem.value = rgbString;
		this.elem.style.backgroundColor = rgbString;

		this.pickerArea.elem.style.backgroundColor = `hsl(${hsv.h}, 100%, 50%)`;

		if (triggerEvent) this.onChange(this);
	}

	normalizePosition(evt, parent, offsetX, offsetY) {
		const position = {
			x: evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX,
			y: evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY,
		};
		const boundingRect = parent.getBoundingClientRect();

		// Account for parent element position
		position.x -= boundingRect.left;
		position.y -= boundingRect.top;

		// Account for indicator size
		position.x += offsetX;
		position.y += offsetY;

		// Account for parent element bounds
		position.x = Math.min(Math.max(offsetX, position.x), parent.clientWidth + offsetX);
		position.y = Math.min(Math.max(offsetY, position.y), parent.clientHeight + offsetY);

		return position;
	}

	pickerMove(evt) {
		evt.preventDefault();

		if (this.runningAnim) return;
		this.runningAnim = true;

		const indicatorOffsetX = this.pickerIndicator.elem.clientWidth / 2;
		const indicatorOffsetY = this.pickerIndicator.elem.clientHeight / 2;
		const position = this.normalizePosition(evt, this.pickerArea.elem, indicatorOffsetX, indicatorOffsetY);
		const pickerAreaWidth = this.pickerArea.elem.clientWidth;
		const pickerAreaHeight = this.pickerArea.elem.clientHeight;

		position.x -= indicatorOffsetX;
		position.y -= indicatorOffsetY;

		const { h } = this.color.toHsv();

		const newS = position.x / pickerAreaWidth;
		const newV = (pickerAreaHeight - position.y) / pickerAreaHeight;

		this.addAnimation(() => {
			this.pickerIndicator.setTransform(`translate3d(${position.x}px, ${position.y}px, 0)`);

			this.set({ h, s: newS, v: newV }, true);

			this.runningAnim = false;
		});
	}

	hueMove(evt) {
		evt.preventDefault();

		if (this.runningAnim) return;
		this.runningAnim = true;

		const indicatorOffset = this.hueIndicator.elem.clientWidth / 2;
		const position = this.normalizePosition(evt, this.hueArea.elem, indicatorOffset, indicatorOffset);
		const hueAreaWidth = this.hueArea.elem.clientWidth;

		position.x -= indicatorOffset;

		const { s, v } = this.color.toHsv();

		const newHue = (position.x / hueAreaWidth) * 360;

		this.addAnimation(() => {
			this.hueIndicator.setTransform(`translate3d(${position.x - indicatorOffset / 2}px, 0, 0)`);

			this.set({ h: newHue, s, v }, true);

			this.pickerArea.elem.style.backgroundColor = `hsl(${newHue}, 100%, 50%)`;

			this.runningAnim = false;
		});
	}

	onPointerDown(evt) {
		if (dom.isMobile && !evt.targetTouches) return;

		if (evt.target === this.pickerArea.elem || evt.target === this.hueArea.elem) {
			const moveFunc = this[`${evt.target === this.hueArea.elem ? 'hue' : 'picker'}Move`].bind(this);

			const dropFunc = () => {
				document.removeEventListener('mouseup', dropFunc);
				document.removeEventListener('mousemove', moveFunc);
				document.removeEventListener('touchend', dropFunc);
				document.removeEventListener('touchcancel', dropFunc);
				document.removeEventListener('touchmove', moveFunc);
			};

			document.addEventListener('mouseup', dropFunc);
			document.addEventListener('mousemove', moveFunc);
			document.addEventListener('touchend', dropFunc);
			document.addEventListener('touchcancel', dropFunc);
			document.addEventListener('touchmove', moveFunc);

			moveFunc(evt);
		}
	}
}

export default ColorPicker;
