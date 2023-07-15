import { LabelSupport } from '../LabelSupport';
import { TooltipSupport } from '../TooltipSupport';

class List extends LabelSupport {
	constructor(options = {}) {
		super({
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
		});

		this.append(
			(options.items || []).map(
				item =>
					new TooltipSupport({
						tag: 'li',
						...item,
					}),
			),
		);
	}
}

export default List;
