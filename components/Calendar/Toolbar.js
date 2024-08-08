import { styled, capitalize } from '../../utils';
import { DomElem } from '../DomElem';
import { Button } from '../Button';

const Title = styled(
	DomElem,
	() => `
		text-align: center;
	`,
);

const Left = styled(
	DomElem,
	() => `
		margin-left: 6px;
	`,
);

const Right = styled(
	DomElem,
	() => `
		margin-right: 6px;
	`,
);

const VIEWS = ['day', 'week', 'month'];

class Toolbar extends DomElem {
	constructor({ calendar, ...options } = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, domElem) => `
					display: flex;
					justify-content: space-between;

					${options.styles?.(theme, domElem) || ''}
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
