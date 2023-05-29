import '@fortawesome/fontawesome-free/css/all.css';
import 'source-code-pro/source-code-pro.css';

import state from '../state';
import DomElem from '../DomElem';

export class Page extends DomElem {
	constructor({ styles = () => '', globalStyles = () => '', ...options }) {
		super({
			globalStyles: ({ colors, ...theme }) => `
				html {
					height: 100%;
				}

				body {
					position: relative;
					width: 100%;
					height: 100%;
					box-sizing: border-box;
					overflow: hidden;
					line-height: 1;
					background: ${colors.black};
					color: ${colors.white};
					margin: 0;

					* {
						touch-action: manipulation;
						-webkit-text-size-adjust: none;

						font: 600 16px 'Source Code Pro';
						font-family: 'Source Code Pro', monospace;
						line-height: 1;
					}
				}

				div#app {
					height: 100%;
				}

				@viewport {
					width: device-width;
					zoom: 1;
					min-zoom: 1;
					max-zoom: 1;
				}

				${globalStyles({ colors, ...theme })}
			`,
			styles: ({ colors, ...theme }) => `
				position: relative;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;

				${theme.scrollbar}

				${styles({ colors, ...theme })}
			`,
			autoRender: false,
			...options,
		});

		if (document.readyState !== 'loading') this.onLoad();
		else document.addEventListener('DOMContentLoaded', this.onLoad);
	}

	onLoad() {
		if (this.options.touchSupport !== false) this.detectTouch();

		this.render();
	}

	detectTouch() {
		if (state.touchDetectionEnabled) return;

		state.touchDetectionEnabled = true;

		document.addEventListener('touchstart', this.onPointerEvt);
		document.addEventListener('touchend', this.onPointerEvt);
		document.addEventListener('touchcancel', this.onPointerEvt);
		document.addEventListener('mousedown', this.onPointerEvt);
		document.addEventListener('mouseup', this.onPointerEvt);
	}

	onPointerEvt(evt) {
		const isTouchEvt = evt.type.startsWith('touch');

		if (!isTouchEvt && state.lastTouchTime && performance.now() - state.lastTouchTime < 350) return;
		else if (isTouchEvt) state.lastTouchTime = performance.now();

		state.isTouchDevice = true;
	}
}

export default Page;
