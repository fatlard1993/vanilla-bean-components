import { DomElem } from '../DomElem';
import { TooltipWrapper } from '../TooltipWrapper';

class List extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				tag: 'ul',
				styles: theme => `
				margin: 6px 0;
				padding-left: 32px;

				li {
					line-height: 1.3;
					text-indent: 6px;
				}

				${options.styles?.(theme) || ''}
			`,
			},
			...children,
		);

		this.append(
			(options.items || []).map(
				item =>
					new TooltipWrapper({
						tag: 'li',
						...item,
					}),
			),
		);
	}
}

export default List;
