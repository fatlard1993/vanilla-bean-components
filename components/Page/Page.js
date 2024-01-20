import { applyStyles } from '../../DomElem/utils/styles';
import { DomElem } from '../DomElem';
import context from '../context';

class Page extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, domElem) => `
					position: relative;
					display: flex;
					flex-direction: column;
					width: 100vw;
					height: 100vh;

					${options.styles?.(theme, domElem) || ''}
				`,
				autoRender: 'onload',
			},
			...children,
		);

		applyStyles({
			styles: ({ page }) => page,
			theme: context.domElem.theme,
			context: this,
		});
	}
}

export default Page;
