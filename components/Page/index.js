import '@fortawesome/fontawesome-free/css/all.css';
import 'source-code-pro/source-code-pro.css';

import dom from '../../utils/dom';

import DomElem from '../DomElem';

export class Page extends DomElem {
	constructor({ styles = () => '', globalStyles = () => '', ...options }) {
		super({
			globalStyles: ({ colors, ...theme }) => `
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
		if (this.options.mobileSupport !== false) dom.mobile.detect();

		this.render();
	}
}

export default Page;
