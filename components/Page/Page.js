import { DomElem } from '../DomElem';

class Page extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				globalStyles: (theme, domElem) => `
					html {
						height: 100%;
					}

					body {
						display: flex;
						position: relative;
						width: 100vw;
						height: 100vh;
						box-sizing: border-box;
						overflow: hidden;
						line-height: normal;
						tab-size: 2;
						background: ${theme.colors.black};
						color: ${theme.colors.white};
						margin: 0;

						* {
							touch-action: manipulation;
							-webkit-text-size-adjust: none;

							font: 600 16px 'Source Code Pro';
							font-family: 'Source Code Pro', monospace;
							line-height: normal;
						}
					}

					@viewport {
						width: device-width;
						zoom: 1;
						min-zoom: 1;
						max-zoom: 1;
					}

					${theme.code}

					${options.globalStyles?.(theme, domElem) || ''}
				`,
				styles: (theme, domElem) => `
					position: relative;
					display: flex;
					flex-direction: column;
					width: 100vw;
					height: 100vh;

					${theme.scrollbar}

					${options.styles?.(theme, domElem) || ''}
				`,
				autoRender: 'onload',
			},
			...children,
		);
	}

	render() {
		if (this.options.touchSupport !== false) this.detectTouch();

		super.render();
	}
}

export default Page;
