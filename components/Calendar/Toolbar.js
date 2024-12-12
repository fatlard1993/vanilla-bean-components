import { styled, capitalize } from '../../utils';
import { Component } from '../Component';
import { Button } from '../Button';

const Title = styled(
	Component,
	() => `
		text-align: center;
	`,
);

const Left = styled(
	Component,
	() => `
		margin-left: 6px;
	`,
);

const Right = styled(
	Component,
	() => `
		margin-right: 6px;
	`,
);

const VIEWS = ['day', 'week', 'month'];

class Toolbar extends Component {
	constructor({ calendar, ...options } = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, component) => `
					display: flex;
					justify-content: space-between;

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);

		this.calendar = calendar;
	}

	render() {
		super.render();

		new Left({
			appendTo: this,
			append: ['previous', 'today', 'next'].map(
				action =>
					new Button({
						textContent: { next: '>', today: 'Today', previous: '<' }[action],
						'aria-label': action,
						onPointerPress: () => {
							this.calendar[action]();
						},
					}),
			),
		});

		this.title = new Title({ appendTo: this });

		new Right({
			appendTo: this,
			append: (this.options.views || VIEWS).map(
				view =>
					new Button({
						addClass: [`set-${view}`, ...(view === this.options.view ? ['pressed'] : [])],
						textContent: capitalize(view),
						onPointerPress: () => {
							this.calendar.setView(view);
						},
					}),
			),
		});
	}
}

export default Toolbar;
