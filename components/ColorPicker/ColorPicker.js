/* eslint-disable spellcheck/spell-checker */
import { TinyColor, random as randomColor } from '@ctrl/tinycolor';

import { debounce, throttle, convertRange } from '../../utils';
import { Component } from '../../Component';
import { styled } from '../../styled';
import theme from '../../theme';
import { Input } from '../Input';
import { Button } from '../Button';
import { saturation, hue } from './svg';

const StyledInput = styled(
	Input,
	({ colors }) => `
		background-color: ${colors.light(colors.gray)};
		padding: 18px 18px 12px;
		border-radius: 5px;
		margin-bottom: 6px;
		text-indent: 0;
		border: none;

		--aug-clip-tl1: initial;
		--aug-clip-tr1: initial;
		--aug-clip-bl1: initial;
		--aug-clip-br1: initial;
		--aug-border: initial;
		--aug-border-bg: radial-gradient(circle at left bottom, ${colors.white} 30px, ${colors} 30px), radial-gradient(circle at right bottom, ${colors.white} 30px, ${colors} 30px), radial-gradient(circle at right top, ${colors.white} 30px, ${colors} 30px), radial-gradient(circle at left top, ${colors.white} 30px, ${colors} 30px);

		input {
			margin: 18px auto 9px;
			width: 90%;
		}
	`,
);

const PickerArea = styled(
	Component,
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
	Component,
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
	Component,
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
	Component,
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

const ColorSwatch = styled(
	Button,
	({ colors }) => `
		margin-top: 3px;

		&.rainbow {
			animation: rainbow 2s linear;
			animation-iteration-count: infinite;
			color: ${colors.black};

			@keyframes rainbow {
				100%,0%{
					background-color: ${colors.light(colors.red)};
				}
				12%{
					background-color: ${colors.light(colors.orange)};
				}
				25%{
					background-color: ${colors.light(colors.yellow)};
				}
				37%{
					background-color: ${colors.light(colors.green)};
				}
				50%{
					background-color: ${colors.light(colors.teal)};
				}
				62%{
					background-color: ${colors.light(colors.blue)};
				}
				75%{
					background-color: ${colors.light(colors.purple)};
				}
				87%{
					background-color: ${colors.light(colors.pink)};
				}
			}
		}
	`,
	{ icon: 'fill-drip' },
);

const defaultOptions = { tag: 'div', value: '#666', onChange: () => {}, augmentedUI: true };

class ColorPicker extends StyledInput {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		options = { ...defaultOptions, ...options };

		if (options.value === 'random') options.value = randomColor().toHslString();

		super(options, children);

		this.pointers = {};
	}

	render() {
		this.textInput = new Input({
			type: 'text',
			value: this.options.subscriber('value', value => this.hslString || value),
			onChange: ({ value }) => this.change(value),
			onKeyUp: debounce(({ target: { value } }) => this.change(value), 700),
			prependTo: this.elem,
		});

		this.hueArea = new HueArea({
			innerHTML: hue,
			prependTo: this.elem,
			onPointerDown: this.interactionInit.bind(this),
		});
		this.hueIndicator = new HueIndicator({
			appendTo: this.hueArea,
		});

		this.pickerArea = new PickerArea({
			innerHTML: saturation,
			prependTo: this.elem,
			onPointerDown: this.interactionInit.bind(this),
		});
		this.pickerIndicator = new PickerIndicator({
			appendTo: this.pickerArea,
		});

		if (this.options.swatches) {
			this.options.swatches.forEach(color => {
				new ColorSwatch({
					appendTo: this.elem,

					onPointerPress: () => this.change(color),
					...(color === 'random'
						? { addClass: ['rainbow'] }
						: {
								style: {
									backgroundColor: color,
									color: theme.colors.mostReadable(color, [theme.colors.white, theme.colors.black]),
								},
							}),
				});
			});
		}

		super.render();
	}

	change(value) {
		this.options.value = this.parseValue(value).hslString;

		this.elem.dispatchEvent(new CustomEvent('change', { detail: { value: this.options.value } }));
	}

	parseValue(value) {
		const color = value === 'random' ? randomColor() : new TinyColor(value);
		const {
			h = this.hue,
			s = this.saturation,
			l = this.lightness ?? 0.5,
		} = typeof value === 'object' ? value : color.toHsv();
		const hslString =
			typeof value === 'object'
				? `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
				: color.toHslString();

		return { h, s, l, color, hslString };
	}

	_setOption(key, value) {
		if (key === 'value') {
			if (!value) return;

			const { h, s, l, color, hslString } = this.parseValue(value);

			this.hslString = hslString;
			this.color = color;
			this.hue = h;
			this.saturation = s;
			this.lightness = l;

			this.elem.style.backgroundColor = hslString;

			this.pickerArea.elem.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
		} else super._setOption(key, value);
	}

	getPosition({ clientX, clientY }) {
		return { x: clientX, y: clientY };
	}

	normalizePosition(event, parent, offsetX, offsetY) {
		const position = this.getPosition(event);
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

	interactionInit(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId]) this.pointers[pointerId] = {};

		this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;

		if (this.pointerInteracting) return;

		this.pointerInteracting = true;
		this.pointers[pointerId].initiator = true;

		const move = throttle(this[`${event.target === this.hueArea.elem ? 'hue' : 'picker'}Move`].bind(this), 60);
		const removePointer = event => {
			event.preventDefault();

			if (!this.pointers[event.pointerId]) return;

			move(event);

			delete this.pointers[event.pointerId];

			this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;

			if (this.activePointerCount === 0) {
				this.pointerInteracting = false;

				document.removeEventListener('pointermove', move);
				document.removeEventListener('pointerup', removePointer);
				document.removeEventListener('pointerleave', removePointer);
				document.removeEventListener('pointercancel', removePointer);
			}
		};

		document.addEventListener('pointermove', move);
		document.addEventListener('pointerup', removePointer);
		document.addEventListener('pointerleave', removePointer);
		document.addEventListener('pointercancel', removePointer);
	}

	pickerMove(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId] || !this.pointers[pointerId].initiator || this.activePointerCount > 2) return;

		const indicatorOffsetX = this.pickerIndicator.elem.clientWidth / 2;
		const indicatorOffsetY = this.pickerIndicator.elem.clientHeight / 2;
		const position = this.normalizePosition(event, this.pickerArea.elem, indicatorOffsetX, indicatorOffsetY);
		const pickerAreaWidth = this.pickerArea.elem.clientWidth;
		const pickerAreaHeight = this.pickerArea.elem.clientHeight;

		position.x -= indicatorOffsetX;
		position.y -= indicatorOffsetY;

		const newS = convertRange(position.x, [0, pickerAreaWidth], [0, 1]);
		const newL = convertRange(position.y + position.x, [0, pickerAreaHeight + pickerAreaWidth], [1, 0]);

		this.pickerIndicator.elem.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;

		this.change({ h: this.hue, s: newS, l: newL });
	}

	hueMove(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId] || !this.pointers[pointerId].initiator || this.activePointerCount > 2) return;

		const indicatorOffset = this.hueIndicator.elem.clientWidth / 2;
		const position = this.normalizePosition(event, this.hueArea.elem, indicatorOffset, indicatorOffset);
		const hueAreaWidth = this.hueArea.elem.clientWidth;

		position.x -= indicatorOffset;

		const newHue = convertRange(position.x, [0, hueAreaWidth], [0, 360]);

		this.hueIndicator.elem.style.transform = `translate3d(${position.x - indicatorOffset / 2}px, 0, 0)`;

		this.change({ h: newHue, s: this.saturation, l: this.lightness });
	}
}

export default ColorPicker;
