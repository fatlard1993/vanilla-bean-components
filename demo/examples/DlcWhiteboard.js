import {
	Component,
	Elem,
	Button,
	Whiteboard,
	Popover,
	ColorPicker,
	Icon,
	Label,
	Input,
	Dialog,
	Notify,
	conditionalList,
	randInt,
	theme,
	styled,
} from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './DlcWhiteboard.js.asText';

const CANVAS_SIZE = 400;

const Inkwell = styled.Component`
	writing-mode: vertical-lr;
	transform: rotate(180deg);
	flex: 1;
	width: 12px;
	margin: 0;
`;

const DlcStoreList = styled.List`
	list-style: none;
	padding: 0;

	li {
		margin: 6px 0;
	}
`;

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

class DlcListItem extends Component {
	constructor(options = {}) {
		super({ registeredEvents: new Set(['qtychange']), ...options });
	}

	build() {
		this._qty = 0;

		this._minus = new Button({
			textContent: '-',
			style: { minWidth: '28px', padding: '2px 8px' },
			onPointerPress: () => {
				if (this._qty <= 0) return;
				this._qty--;
				this._qtyDisplay.elem.textContent = this._qty;
				this.emit('qtychange', this._qty);
			},
		});

		this._qtyDisplay = new Elem({ style: { minWidth: '20px', textAlign: 'center' }, textContent: '0' });

		this._plus = new Button({
			textContent: '+',
			style: { minWidth: '28px', padding: '2px 8px' },
			onPointerPress: () => {
				this._qty++;
				this._qtyDisplay.elem.textContent = this._qty;
				this.emit('qtychange', this._qty);
			},
		});

		this.setStyle({ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' });

		this.content([
			new Elem({ style: { flex: '1' }, textContent: this.options.label }),
			this._minus,
			this._qtyDisplay,
			this._plus,
			new Elem({
				style: { marginLeft: '4px', opacity: '0.6', fontSize: '0.85em', whiteSpace: 'nowrap' },
				textContent: `$${this.options.price} ea`,
			}),
		]);
	}
}

class DlcWhiteboard extends (styled.Component`
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
`) {
	constructor(options) {
		const database = JSON.parse(localStorage.getItem('dlc_whiteboard_db')) || {
			ink: 3,
			color: theme.colors.black.toString(),
			background: theme.colors.white.toString(),
			lineWidth: 3,
			maxLineWidth: 6,
			credits: 10,
			drawThrottle: 200,
			firstInkRunOut: false,
		};

		super({ ...database, ...options });
	}

	build() {
		this._lowInkNotified = false;
		this._credits = new Component();
		this._openStore = new Button({
			textContent: 'Open DLC Store',
			onPointerPress: () => {
				const storeItems = conditionalList([
					{ alwaysItem: { label: 'Ink (+10)', product: 'ink', amount: 10, price: 2 } },
					{ alwaysItem: { label: 'Pen Sizes (+3)', product: 'maxLineWidth', amount: 3, price: 2 } },
					{
						if: this.options.drawThrottle > 0,
						thenItem: { label: 'Pen Resolution (+50)', product: 'drawThrottle', amount: -50, price: 2 },
					},
				]);

				const qtys = new Array(storeItems.length).fill(0);
				const getTotal = () => qtys.reduce((sum, qty, i) => sum + qty * storeItems[i].price, 0);

				const checkoutBtn = new Button({ textContent: 'Checkout $0' });
				const cancelBtn = new Button({ textContent: 'Cancel' });
				const store = {};

				const updateCheckout = () => {
					const total = getTotal();
					checkoutBtn.elem.textContent = `Checkout $${total}`;
					checkoutBtn.elem.disabled = total === 0;
				};

				checkoutBtn.onPointerPress(({ clientX, clientY }) => {
					const total = getTotal();
					if (total > this.options.credits) {
						new Notify({ type: 'error', content: 'Not enough credits', timeout: 2000, x: clientX, y: clientY });
						return;
					}
					storeItems.forEach((item, i) => {
						if (qtys[i] > 0) {
							this.options.credits -= qtys[i] * item.price;
							this.options[item.product] += item.amount * qtys[i];
						}
					});
					new Notify({ content: `Purchase complete! $${total} spent.`, timeout: 2000, x: clientX, y: clientY });
					store.dialog.close();
				});

				cancelBtn.onPointerPress(() => store.dialog.close());

				store.dialog = new Dialog({
					header: 'DLC Store',
					body: new DlcStoreList({
						items: storeItems.map((item, i) => ({
							...item,
							onQtyChange: ({ detail: qty }) => {
								qtys[i] = qty;
								updateCheckout();
							},
						})),
						ListItemComponent: DlcListItem,
					}),
					footer: [checkoutBtn, cancelBtn],
				});
			},
		});
		this._buyCredits = new Button({
			textContent: 'Buy Credits',
			onPointerPress: () => {
				// Create fresh input and label each time so closures capture them directly
				const paymentInput = new Input({ type: 'text' });
				const paymentLabel = new Label(
					{
						label: 'Payment',
						style: { position: 'relative' },
						tooltip: {
							content: 'Almost any form of payment is accepted; Credit, Debit, Transfer, Crypto, etc.',
							position: 'bottom',
							style: { display: 'block', position: 'relative', margin: '6px', maxWidth: 'unset' },
						},
					},
					paymentInput,
				);
				const dlcWhiteboard = this;

				new Dialog({
					header: 'Buy Credits',
					size: 'standard',
					body: paymentLabel,
					buttons: ['Close', 'Submit'],
					onButtonPress: ({ event, button, closeDialog }) => {
						if (button === 'Close') return closeDialog();

						const payment = paymentInput.elem.value;
						const paymentLength = payment.length;
						const amount = payment === '1337' ? randInt(10, 20) : randInt(paymentLength / 4, paymentLength * 1.2);

						if (paymentLength <= 1 || payment === 'love') {
							new Notify({ type: 'error', content: 'Stingy', timeout: 500, x: event.clientX, y: event.clientY });
							closeDialog();
							return;
						}

						const chompTime = 1000;
						const robot = new Icon({
							icon: 'robot',
							animation: 'shake',
							style: { position: 'absolute', bottom: '12px', left: `${24 + paymentLength * 10}px` },
							appendTo: paymentLabel,
						});

						setTimeout(
							() => {
								closeDialog();
								dlcWhiteboard.options.credits += amount;
								new Notify({
									content: `You've been awarded $${amount}`,
									timeout: 2000,
									x: event.clientX,
									y: event.clientY,
								});
							},
							chompTime * (paymentLength + 0.5),
						);

						const chomper = setInterval(() => {
							const remaining = paymentInput.elem.value.length;
							const chompSize = Math.ceil(Math.max(remaining / 5, 2));
							if (remaining === 0) {
								robot.elem.remove();
								clearInterval(chomper);
								return;
							}
							robot.elem.style.left = `${20 + (remaining - chompSize) * 10}px`;
							paymentInput.elem.value = paymentInput.elem.value.slice(0, -chompSize);
						}, chompTime);
					},
				});
			},
		});
		const canvasWrapper = new Elem({
			style: { display: 'flex', flexDirection: 'row', margin: '12px auto', width: 'fit-content' },
		});

		const sidebar = new Elem({
			style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '4px' },
			appendTo: canvasWrapper,
		});

		this._whiteboard = new Whiteboard({
			width: `${CANVAS_SIZE}px`,
			height: `${CANVAS_SIZE}px`,
			color: this.options.subscriber('color'),
			background: this.options.subscriber('background'),
			lineWidth: this.options.subscriber('lineWidth'),
			readOnly: this.options.subscriber('ink', ink => ink <= 0),
			drawThrottle: this.options.subscriber('drawThrottle'),
			appendTo: canvasWrapper,
			onDraw: ({ detail: { from, to, event } }) => {
				const prevInk = this.options.ink;
				const length = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
				const inkUse = (length || this.options.lineWidth) * this.options.lineWidth * 0.0005;

				this.options.ink -= inkUse;

				if (!this._lowInkNotified && prevInk > 1 && this.options.ink <= 1) {
					this._lowInkNotified = true;
					new Notify({
						type: 'warning',
						content: 'Low ink! Head to the DLC store.',
						x: event.clientX,
						y: event.clientY,
					});
				}

				if (prevInk > 0 && this.options.ink <= 0) {
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
		this._inkwell = new Inkwell({
			tag: 'progress',
			style: this.options.subscriber('color', accentColor => ({ accentColor })),
			max: 100,
			value: this.options.subscriber('ink'),
			appendTo: sidebar,
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

		new Button({
			icon: 'paintbrush',
			style: this.options.subscriber('color', backgroundColor => ({
				backgroundColor,
				color: theme.colors.mostReadable(backgroundColor, [theme.colors.white, theme.colors.black]),
			})),
			onPointerPress: event => colorPicker.show({ x: event.clientX, y: event.clientY, maxHeight: 378, maxWidth: 318 }),
			appendTo: sidebar,
		});

		// colorPicker stays in document.body — moving it would disconnect/reconnect
		// its children and destroy their event listeners via the cleanup system
		this.addCleanup('colorPicker', () => colorPicker.elem.remove());

		this.content([this._credits, this._openStore, this._buyCredits, canvasWrapper]);
	}

	_setOption(key, value) {
		if (key === 'credits') this._credits.content(`Credits: ${value}`);
		else super._setOption(key, value);
		if (key === 'ink' && value > 1) this._lowInkNotified = false;
	}
}

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new DlcWhiteboard({ style: { height: '70vh' }, appendTo: this.demoWrapper });
	}
}
