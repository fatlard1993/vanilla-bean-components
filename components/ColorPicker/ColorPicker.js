import { TinyColor, random as randomColor } from '@ctrl/tinycolor';

import { debounceCallback, styled } from '../../utils';
import { state } from '../state';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { TextInput } from '../TextInput';

import { saturation, hue } from './svg';

const PickerArea = styled(
	DomElem,
	({ colors }) => `
		position: relative;
		width: 150px;
		height: 150px;
		margin: 0 auto;
		box-shadow: 0px 0px 0px 2px ${colors.darker(colors.gray)};

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
		border: 2px solid ${colors.gray};
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
		box-shadow: 0px 0px 0px 2px ${colors.darker(colors.gray)};

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
		border: 4px solid ${colors.gray};
		border-radius: 4px;
		background-color: ${colors.white};
	`,
);

const defaultOptions = { tag: 'div', value: '#666', onChange: () => {} };

class ColorPicker extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		options = { ...defaultOptions, ...options };

		const textInput = new TextInput({
			value: options.value,
			onChange: ({ value }) => this.set(value),
			onKeyUp: ({ target: { value } }) => debounceCallback(() => this.set(value), 700),
		});

		super({
			...options,
			appendToLabel: [textInput, ...(options.appendToLabel ? [options.appendToLabel] : [])],
			styles: theme => `
				background-color: ${theme.colors.light(theme.colors.gray)};
				padding: 14px;
				border-radius: 5px;
				margin-bottom: 6px;
				text-indent: 0;

				${options.styles ? options.styles(theme) : ''}
			`,
		});

		this.onChange = options.onChange;

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

		this.textInput = textInput;

		this.set(options.value, true);

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

	normalizePosition(event, parent, offsetX, offsetY) {
		const position = {
			x: event.targetTouches ? event.targetTouches[0].pageX : event.clientX,
			y: event.targetTouches ? event.targetTouches[0].pageY : event.clientY,
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

	pickerMove(event) {
		event.preventDefault();

		if (this.runningAnimation) return;
		this.runningAnimation = true;

		const indicatorOffsetX = this.pickerIndicator.elem.clientWidth / 2;
		const indicatorOffsetY = this.pickerIndicator.elem.clientHeight / 2;
		const position = this.normalizePosition(event, this.pickerArea.elem, indicatorOffsetX, indicatorOffsetY);
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

			this.runningAnimation = false;
		});
	}

	hueMove(event) {
		event.preventDefault();

		if (this.runningAnimation) return;
		this.runningAnimation = true;

		const indicatorOffset = this.hueIndicator.elem.clientWidth / 2;
		const position = this.normalizePosition(event, this.hueArea.elem, indicatorOffset, indicatorOffset);
		const hueAreaWidth = this.hueArea.elem.clientWidth;

		position.x -= indicatorOffset;

		const { s, v } = this.color.toHsv();

		const newHue = (position.x / hueAreaWidth) * 360;

		this.addAnimation(() => {
			this.hueIndicator.setTransform(`translate3d(${position.x - indicatorOffset / 2}px, 0, 0)`);

			this.set({ h: newHue, s, v }, true);

			this.pickerArea.elem.style.backgroundColor = `hsl(${newHue}, 100%, 50%)`;

			this.runningAnimation = false;
		});
	}

	onPointerDown(event) {
		if (state.isTouchDevice && !event.targetTouches) return;

		if (event.target === this.pickerArea.elem || event.target === this.hueArea.elem) {
			const onMove = this[`${event.target === this.hueArea.elem ? 'hue' : 'picker'}Move`].bind(this);

			const onDrop = () => {
				document.removeEventListener('mouseup', onDrop);
				document.removeEventListener('mousemove', onMove);
				document.removeEventListener('touchend', onDrop);
				document.removeEventListener('touchcancel', onDrop);
				document.removeEventListener('touchmove', onMove);
			};

			document.addEventListener('mouseup', onDrop);
			document.addEventListener('mousemove', onMove);
			document.addEventListener('touchend', onDrop);
			document.addEventListener('touchcancel', onDrop);
			document.addEventListener('touchmove', onMove);

			onMove(event);
		}
	}
}

export default ColorPicker;
