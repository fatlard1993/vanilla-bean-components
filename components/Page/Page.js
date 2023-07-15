import '@fortawesome/fontawesome-free/css/all.css';
import 'source-code-pro/source-code-pro.css';

import { state } from '../state';
import { DomElem } from '../DomElem';

class Page extends DomElem {
	constructor(options = {}) {
		super({
			...options,
			globalStyles: theme => `
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
					tab-size: 2;
					background: ${theme.colors.black};
					color: ${theme.colors.white};
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

				${theme.code}

				${options.globalStyles?.(theme) || ''}
			`,
			styles: theme => `
				position: relative;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;

				${theme.scrollbar}

				${options.styles?.(theme) || ''}
			`,
			autoRender: false,
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

	onPointerEvt({ type }) {
		state.isTouchDevice = type.startsWith('touch');
	}
}

export default Page;
