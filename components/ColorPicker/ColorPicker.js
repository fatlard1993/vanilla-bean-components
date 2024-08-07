/* eslint-disable spellcheck/spell-checker */
import { TinyColor, random as randomColor } from '@ctrl/tinycolor';

import { debounce, styled } from '../../utils';
import context from '../context';
import { DomElem } from '../DomElem';
import { Input } from '../Input';
import { Button } from '../Button';

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

const ColorSwatch = styled(
	Button,
	() => `
		margin-top: 3px;
	`,
);

const defaultOptions = { tag: 'div', value: '#666', onChange: () => {} };

class ColorPicker extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		options = { ...defaultOptions, ...options };

		if (options.value === 'random') options.value = randomColor().toHslString();

		super(
			{
				...options,
				styles: (theme, domElem) => `
					background-color: ${theme.colors.light(theme.colors.gray)};
					padding: 18px 18px 12px;
					border-radius: 5px;
					margin-bottom: 6px;
					text-indent: 0;
					border: none;

					--aug-tl1: 32px;
					--aug-tr-extend2: 42%;
					--aug-br-extend1: 0px;
					--aug-border-bg: linear-gradient(-66deg, ${theme.colors
						.lighter(theme.colors.teal)
						.setAlpha(0.5)}, ${theme.colors.blue.setAlpha(0.5)});

					input {
						margin: 18px auto 9px;
						width: 90%;
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);

		this.elem.setAttribute('data-augmented-ui', 'tl-clip tr-2-clip-y br-2-clip-y bl-clip border');

		document.addEventListener('mousedown', this.onPointerDown.bind(this));
		document.addEventListener('touchstart', this.onPointerDown.bind(this));
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
		});
		this.hueIndicator = new HueIndicator({
			appendTo: this.hueArea,
		});

		this.pickerArea = new PickerArea({
			innerHTML: saturation,
			prependTo: this.elem,
		});
		this.pickerIndicator = new PickerIndicator({
			appendTo: this.pickerArea,
		});

		if (this.options.swatches) {
			this.options.swatches.forEach(color => {
				new ColorSwatch({
					appendTo: this.elem,
					icon: 'fill-drip',
					styles: ({ colors }) =>
						color === 'random'
							? `
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
							`
							: `
								background: ${color};
								color: ${colors.mostReadable(color, [colors.white, colors.black])};
							`,
					onPointerPress: () => this.change(color),
				});
			});
		}

		super.render();
	}

	setOption(key, value) {
		if (key === 'value') this.set(value === 'random' ? randomColor().toHslString() : value);
		else super.setOption(key, value);
	}

	set(value) {
		if (!value) return;

		const color = value === 'random' ? randomColor() : new TinyColor(value);
		const { h, s, l } = typeof value === 'object' ? value : color.toHsv();
		const hslString =
			typeof value === 'object'
				? `hsl(${Math.round(value.h)}, ${Math.round(value.s * 100)}%, ${Math.round(value.l * 100)}%)`
				: color.toHslString();

		this.hslString = hslString;
		this.hue = h;
		this.saturation = s;
		this.lightness = l;

		this.elem.style.backgroundColor = hslString;

		this.pickerArea.elem.style.backgroundColor = `hsl(${h}, 100%, 50%)`;

		return { value: hslString, color, h, s, l };
	}

	change(value) {
		if (!value) {
			this.options.onChange.call(this, { value: '' });

			return;
		}

		this.options.onChange.call(this, this.set(value));
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

		const newS = position.x / pickerAreaWidth;
		const newL = (pickerAreaHeight - position.y) / pickerAreaHeight;

		requestAnimationFrame(() => {
			this.pickerIndicator.elem.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;

			this.change({ h: this.hue, s: newS, l: newL });

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

		const newHue = Math.round((position.x / hueAreaWidth) * 360);

		requestAnimationFrame(() => {
			this.hueIndicator.elem.style.transform = `translate3d(${position.x - indicatorOffset / 2}px, 0, 0)`;

			this.change({ h: newHue, s: this.saturation, l: this.lightness });

			this.pickerArea.elem.style.backgroundColor = `hsl(${newHue}, 100%, 50%)`;

			this.runningAnimation = false;
		});
	}

	onPointerDown(event) {
		if (context.domElem.isTouchDevice && !event.targetTouches) return;

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
