import { applyStyles } from '../../Component/utils/styles';
import { Component } from '../Component';
import context from '../context';

class Page extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, component) => `
					position: relative;
					display: flex;
					flex-direction: column;
					width: 100%;
					height: 100%;

					${options.styles?.(theme, component) || ''}
				`,
				autoRender: 'onload',
			},
			...children,
		);

		applyStyles({
			styles: ({ page }) => page,
			theme: context.component.theme,
			context: this,
		});
	}
}

export default Page;
