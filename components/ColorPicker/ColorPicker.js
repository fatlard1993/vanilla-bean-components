import { TinyColor, random as randomColor } from '@ctrl/tinycolor';

import { debounce, throttle, convertRange } from '../../utils';
import { Component } from '../../Component';
import { styled } from '../../styled';
import theme from '../../theme';
import { Input } from '../Input';
import { Button } from '../Button';
import { saturation } from './svg';

const StyledInput = styled(
	Input,
	({ colors }) => `
		background-color: ${colors.light(colors.gray)};
		padding: 18px 18px 12px;
		border-radius: 3px;
		margin-bottom: 6px;
		text-indent: 0;
		border: none;

		& input {
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

		& * {
			pointer-events: none;
		}
	`,
);

const PickerIndicator = styled(
	Component,
	() => `
		position: absolute;
		top: -4px;
		left: -4px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 1.5px solid white;
		box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
		background: transparent;
		pointer-events: none;
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
		cursor: ew-resize;
		background: linear-gradient(to right,
			hsl(0,100%,50%), hsl(10,100%,50%), hsl(20,100%,50%), hsl(30,100%,50%),
			hsl(40,100%,50%), hsl(50,100%,50%), hsl(60,100%,50%), hsl(70,100%,50%),
			hsl(80,100%,50%), hsl(90,100%,50%), hsl(100,100%,50%), hsl(110,100%,50%),
			hsl(120,100%,50%), hsl(130,100%,50%), hsl(140,100%,50%), hsl(150,100%,50%),
			hsl(160,100%,50%), hsl(170,100%,50%), hsl(180,100%,50%), hsl(190,100%,50%),
			hsl(200,100%,50%), hsl(210,100%,50%), hsl(220,100%,50%), hsl(230,100%,50%),
			hsl(240,100%,50%), hsl(250,100%,50%), hsl(260,100%,50%), hsl(270,100%,50%),
			hsl(280,100%,50%), hsl(290,100%,50%), hsl(300,100%,50%), hsl(310,100%,50%),
			hsl(320,100%,50%), hsl(330,100%,50%), hsl(340,100%,50%), hsl(350,100%,50%),
			hsl(360,100%,50%));
		background-size: 100% 100%;
		background-repeat: repeat-x;

		& * {
			pointer-events: none;
		}
	`,
);

const HueIndicator = styled(
	Component,
	() => `
		position: absolute;
		width: 8px;
		top: -3px;
		bottom: -3px;
		left: calc(50% - 4px);
		border-radius: 4px;
		border: 1.5px solid white;
		box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
		background: transparent;
		pointer-events: none;
	`,
);

const ColorSwatch = styled(
	Button,
	({ colors }) => `
		margin-top: 3px;
		margin-right: 3px;

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

const defaultOptions = { tag: 'div', value: '#666', onChange: () => {} };

/**
 * Interactive color picker component with HSL controls and color swatches.
 *
 * Provides visual color selection with saturation/lightness area and hue slider controls.
 * Supports text input, predefined color swatches, and random color generation.
 * @param {object} [options={}] - ColorPicker configuration options
 * @param {string} [options.tag='div'] - HTML tag for the component wrapper
 * @param {string} [options.value='#666'] - Initial color value (CSS color, 'random' for random color)
 * @param {Function} [options.onChange] - Callback function called when color changes
 * @param {Array<string>} [options.swatches] - Array of predefined color values for swatch buttons
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {ColorPicker} ColorPicker component instance
 */
class ColorPicker extends StyledInput {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		options = { ...defaultOptions, ...options };

		if (options.value === 'random') options.value = randomColor().toHslString();

		super(options, ...children);

		this.pointers = {};
	}

	build() {
		this.textInput = new Input({
			type: 'text',
			value: this.options.subscriber('value', value => this.hslString || value),
			onChange: ({ value }) => this.change(value),
			onKeyUp: debounce(({ target: { value } }) => this.change(value), 700),
			prependTo: this.elem,
		});

		this.hueArea = new HueArea({
			prependTo: this.elem,
			onPointerDown: this.interactionInit.bind(this),
		});
		this.hueIndicator = new HueIndicator({ appendTo: this.hueArea });

		this.pickerArea = new PickerArea({
			innerHTML: saturation(this.uniqueId),
			prependTo: this.elem,
			onPointerDown: this.interactionInit.bind(this),
		});
		this.pickerIndicator = new PickerIndicator({
			appendTo: this.pickerArea,
		});

		const sizeObserver = new ResizeObserver(() => {
			if (this.pickerArea.elem.clientWidth > 0) {
				this._positionIndicators();
				sizeObserver.disconnect();
			}
		});
		sizeObserver.observe(this.pickerArea.elem);
		this.addCleanup('sizeObserver', () => sizeObserver.disconnect());

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
	}

	/**
	 * Changes the color value and triggers change event.
	 * @param {string|object} value - New color value (CSS string, HSL object, or 'random')
	 */
	change(value) {
		this.options.value = this.parseValue(value).hslString;

		this.elem.dispatchEvent(new CustomEvent('change', { detail: { value: this.options.value } }));
	}

	// HSV ↔ HSL conversion helpers (internal, not part of public API)
	static hsvToHsl(h, sv, v) {
		const l = v * (1 - sv / 2);
		const s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
		return { h, s, l };
	}

	static hslToHsv(h, s, l) {
		const v = l + s * Math.min(l, 1 - l);
		const sv = v === 0 ? 0 : 2 * (1 - l / v);
		return { h, sv, v };
	}

	/**
	 * Parses color value into HSL components and TinyColor instance.
	 * @param {string|object} value - Color value to parse
	 * @returns {object} Parsed color data
	 */
	parseValue(value) {
		const color = value === 'random' ? randomColor() : new TinyColor(value);
		const { h, s, l } =
			typeof value === 'object' ? { h: value.h ?? this.hue, s: value.s ?? 0, l: value.l ?? 0.5 } : color.toHsl();
		const hslString =
			typeof value === 'object'
				? `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
				: color.toHslString();
		const { sv, v } = ColorPicker.hslToHsv(h, s, l);

		return { h, s, l, sv, v, color, hslString };
	}

	_setHueBackground(hue, width) {
		// Shift the repeating gradient so the selected hue sits under the center needle.
		// background-position-x shifts the image rightward by the offset value,
		// so a positive value moves the gradient right (earlier hues appear at center).
		const offset = width * (0.5 - hue / 360);
		this.hueArea.elem.style.backgroundPositionX = `${offset}px`;
	}

	_positionIndicators() {
		if (!this.pickerArea?.elem || !this.hueArea?.elem) return;

		const pickerW = this.pickerArea.elem.clientWidth;
		const pickerH = this.pickerArea.elem.clientHeight;
		const hueW = this.hueArea.elem.clientWidth;

		if (!pickerW || !hueW) return;

		const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

		// HSV: x = saturation, y = (1 - value) — matches the gradient exactly
		const pickerX = clamp((this.sv ?? 0) * pickerW, 0, pickerW);
		const pickerY = clamp((1 - (this.v ?? 1)) * pickerH, 0, pickerH);
		this.pickerIndicator.elem.style.transform = `translate3d(${pickerX}px, ${pickerY}px, 0)`;

		// Hue: shift the gradient so selected hue appears under the center needle
		this._setHueBackground(this.hue ?? 0, hueW);
	}

	static handlers = {
		value(value) {
			if (!value) return;

			const { h, sv, v, color, hslString } = this.parseValue(value);

			this.hslString = hslString;
			this.color = color;
			// Preserve hue when achromatic (sv=0 loses hue info) or when TinyColor
			// wraps 360 to 0 (same color, different position on the slider)
			const isCircularWrap = sv > 0 && h === 0 && this.hue > 350;
			if (!isCircularWrap) this.hue = sv > 0 ? h : (this.hue ?? h);
			this.sv = sv;
			this.v = v;

			this.elem.style.backgroundColor = hslString;

			this.pickerArea?.elem && (this.pickerArea.elem.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`);

			const tryPosition = () => {
				if (this.pickerArea?.elem?.clientWidth > 0) {
					this._positionIndicators();
				} else {
					requestAnimationFrame(tryPosition);
				}
			};
			requestAnimationFrame(tryPosition);
		},
	};

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

		this.replaceCleanup('gestureListeners', () => {
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerup', removePointer);
			document.removeEventListener('pointerleave', removePointer);
			document.removeEventListener('pointercancel', removePointer);
		});
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

		const newSv = convertRange(position.x, [0, pickerAreaWidth], [0, 1]);
		const newV = convertRange(position.y, [0, pickerAreaHeight], [1, 0]);
		const { h, s, l } = ColorPicker.hsvToHsl(this.hue, newSv, newV);

		this.pickerIndicator.elem.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;

		this.change({ h, s, l });
	}

	hueMove(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId] || !this.pointers[pointerId].initiator || this.activePointerCount > 2) return;

		const prevX = this.pointers[pointerId].prevX ?? event.clientX;
		const delta = event.clientX - prevX;
		this.pointers[pointerId].prevX = event.clientX;

		const hueAreaWidth = this.hueArea.elem.clientWidth;
		const newHue = (this.hue - (delta / hueAreaWidth) * 360 + 720) % 360;

		this._setHueBackground(newHue, hueAreaWidth);

		const sv = this.sv > 0 ? this.sv : 1;
		const v = this.v > 0 ? this.v : 0.7;
		const { s, l } = ColorPicker.hsvToHsl(newHue, sv, v);
		this.change({ h: newHue, s, l });
	}
}

export default ColorPicker;
