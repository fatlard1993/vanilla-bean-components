import {
	DomElem,
	Button,
	Whiteboard,
	Popover,
	ColorPicker,
	Icon,
	Label,
	Input,
	Dialog,
	List,
	Notify,
	context,
	conditionalList,
	randInt,
} from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

const CANVAS_SIZE = 400;

class Achievement extends Notify {
	constructor({
		whiteboard,
		label,
		property,
		award = 2 * Math.round(randInt(2, 10) / 2),
		awardProperty = 'credits',
		awardLabel = awardProperty,
		...options
	}) {
		super({ content: `Achievement Unlocked! "${label}" (+${award} ${awardLabel})`, ...options });

		whiteboard.options[property] = true;

		whiteboard.options[awardProperty] += award;
	}
}

class DlcListItem extends DomElem {
	render() {
		this._buy = new Button({
			icon: 'cart-shopping',
			textContent: `$${this.options.price}`,
			style: { marginLeft: '6px' },
			onPointerPress: ({ clientX, clientY }) => {
				if (this.options.whiteboard.options.credits < this.options.price) {
					if (this.parent.parent.errorNotification?.parentElem) {
						this.parent.parent.errorNotification.edgeAwarePlacement({ x: clientX, y: clientY });

						return;
					}

					this.parent.parent.errorNotification = new Notify({
						type: 'error',
						content: 'Not enough credits',
						timeout: 2000,
						x: clientX,
						y: clientY,
					});

					return;
				}

				this.options.whiteboard.options.credits -= this.options.price;
				this.options.whiteboard.options[this.options.product] += this.options.amount;

				if (this.successNotification?.parentElem) {
					this.successNotification.count = this.successNotification.count || 1;
					++this.successNotification.count;

					this.successNotification.content(
						`Successfully purchased ${this.options.label} (x${this.successNotification.count})`,
					);

					return;
				}

				this.successNotification = new Notify({
					content: `Successfully purchased ${this.options.label}`,
					timeout: 2000,
					x: clientX,
					y: clientY,
				});
			},
		});

		this.content([this._buy, this.options.label]);

		super.render();
	}
}

class DlcWhiteboard extends DomElem {
	constructor() {
		const database = JSON.parse(localStorage.getItem('dlc_whiteboard_db')) || {
			ink: 3,
			color: context.domElem.theme.colors.black.toString(),
			background: context.domElem.theme.colors.white.toString(),
			lineWidth: 3,
			maxLineWidth: 6,
			credits: 10,
			drawThrottle: 200,
			firstInkRunOut: false,
		};

		console.log({ database });

		super({
			...database,
			styles: () => `
				height: 100%;
				display: flex;
				flex-direction: column;
				position: relative;
			`,
		});
	}

	render() {
		this._credits = new DomElem();
		this._openStore = new Button({
			textContent: 'Open DLC Store',
			onPointerPress: () =>
				new Dialog({
					header: 'DLC Store',
					body: new List({
						styles: () => `
								list-style: none;
								padding: 0;

								li {
									margin: 6px 0;
								}
							`,
						items: conditionalList([
							{ alwaysItem: { label: 'Ink (+10)', product: 'ink', amount: 10, price: '2' } },
							{ alwaysItem: { label: 'Pen Sizes (+3)', product: 'maxLineWidth', amount: 3, price: '2' } },
							{
								if: this.options.drawThrottle > 0,
								thenItem: { label: 'Pen Resolution (+50)', product: 'drawThrottle', amount: -50, price: '2' },
							},
						]).map(item => ({ ...item, whiteboard: this })),
						ListItemComponent: DlcListItem,
					}),
					buttons: ['Close'],
					onButtonPress: ({ closeDialog }) => closeDialog(),
				}),
		});
		this._buyCredits = new Button({
			textContent: 'Buy Credits',
			onPointerPress: () =>
				new Dialog({
					header: 'Buy Credits',
					size: 'standard',
					body: new Label(
						{
							label: 'Payment',
							tooltip: {
								content: 'Almost any form of payment is accepted; Credit, Debit, Transfer, Crypto, etc.',
								position: 'bottom',
								style: { display: 'block', position: 'relative', margin: '6px', maxWidth: 'unset' },
							},
						},
						new Input({ type: 'text' }),
					),
					buttons: ['Close', 'Submit'],
					whiteboard: this,
					onButtonPress: function ({ event, button, closeDialog }) {
						if (button === 'Close') return closeDialog();

						const payment = this.body.options.for.elem.value;
						const paymentLength = payment.length;
						const amount = payment === '1337' ? randInt(10, 20) : randInt(paymentLength / 4, paymentLength * 1.2);

						if (paymentLength <= 1 || payment === 'love') {
							new Notify({
								type: 'error',
								content: 'Stingy',
								timeout: 500,
								x: event.clientX,
								y: event.clientY,
							});

							closeDialog();

							return;
						}

						const chompTime = 1000;
						const robot = new Icon({
							icon: 'robot',
							animation: 'shake',
							style: { position: 'absolute', bottom: '16px', left: `${20 + paymentLength * 10}px` },
							appendTo: this.body,
						});

						setTimeout(
							() => {
								closeDialog();

								this.whiteboard.options.credits += amount;

								new Notify({
									content: `You've been awarded $${amount}`,
									timeout: 2000,
									x: event.clientX,
									y: event.clientY,
								});
							},
							chompTime * (paymentLength + 0.5),
						);

						this.chomper = setInterval(() => {
							const paymentLength = this.body.options.for.elem.value.length;
							const chompSize = Math.ceil(Math.max(paymentLength / 5, 2));

							if (paymentLength === 0) {
								robot.elem.remove();
								clearInterval(this.chomper);
								return;
							}

							robot.elem.style.left = `${20 + (paymentLength - chompSize) * 10}px`;
							this.body.options.for.elem.value = this.body.options.for.elem.value.slice(0, -chompSize);
						}, chompTime);
					},
				}),
		});
		this._whiteboard = new Whiteboard({
			width: `${CANVAS_SIZE}px`,
			height: `${CANVAS_SIZE}px`,
			color: this.options.subscriber('color'),
			background: this.options.subscriber('background'),
			lineWidth: this.options.subscriber('lineWidth'),
			readOnly: this.options.subscriber('ink', ink => ink <= 0),
			style: { margin: '12px auto' },
			drawThrottle: this.options.subscriber('drawThrottle'),
			onDraw: ({ detail: { from, to } }) => {
				const length = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
				const inkUse = (length || this.options.lineWidth) * this.options.lineWidth * 0.0005;

				this.options.ink -= inkUse;
			},
			onChange: ({ detail: { event } }) => {
				if (this.options.ink <= 0) {
					new Notify({
						type: 'error',
						content: "Looks like you've run out of ink, buy more in the store!",
						x: event.clientX,
						y: event.clientY,
					});

					if (!this.options.firstInkRunOut) {
						new Achievement({
							label: 'Ran out of ink',
							property: 'firstInkRunOut',
							x: event.clientX - 100,
							y: event.clientY - 100,
							whiteboard: this,
						});
					}
				}
			},
		});
		this._inkwell = new DomElem({
			tag: 'progress',
			styles: () => `
				transform-origin: 0 100%;
				transform: rotate(-90deg);
				position: absolute;
				bottom: 88px;
				left: 6px;
				height: 12px;
				width: 300px;
			`,
			style: this.options.subscriber('color', accentColor => ({ accentColor })),
			max: 100,
			value: this.options.subscriber('ink'),
		});

		const colorPicker = new Popover(
			{
				style: { background: 'none', border: 'none', padding: 0, margin: '-6px' },
				autoOpen: false,
			},
			new ColorPicker(
				{
					value: this.options.color,
					onChange: ({ value }) => {
						this.options.color = value;
					},
					swatches: ['white', 'black', 'red', 'green', 'blue', 'random'],
				},
				new Input({
					type: 'range',
					value: this.options.subscriber('lineWidth'),
					min: 1,
					max: this.options.subscriber('maxLineWidth'),
					onChange: event => {
						event.preventDefault();
						event.stopPropagation();

						this.options.lineWidth = event.value;
						this._inkwell.elem.style.height = `${Number.parseInt(event.value) + 9}px`;
					},
				}),
			),
		);

		const colorSwatch = new Button({
			icon: 'paintbrush',
			style: this.options.subscriber('color', backgroundColor => ({
				backgroundColor,
				color: context.domElem.theme.colors.mostReadable(backgroundColor, [
					context.domElem.theme.colors.white,
					context.domElem.theme.colors.black,
				]),
			})),
			onPointerPress: event => colorPicker.show({ x: event.clientX, y: event.clientY, maxHeight: 378, maxWidth: 318 }),
		});

		this.content([
			this._credits,
			this._openStore,
			this._buyCredits,
			this._whiteboard,
			this._inkwell,
			colorPicker,
			colorSwatch,
		]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'credits') this._credits.content(`Credits: ${value}`);
		else super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ style: { height: '100%' }, appendTo: this }, new DlcWhiteboard());
	}
}
