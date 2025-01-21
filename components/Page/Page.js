import { shimCSS } from '../../styled';
import { Component } from '../../Component';

shimCSS({
	styles: ({ page }) => page,
});

class Page extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				style: {
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					...options.style,
				},
				autoRender: 'onload',
			},
			...children,
		);
	}
}

export default Page;
