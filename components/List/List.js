import { LabelSupport } from '../LabelSupport';
import { TooltipSupport } from '../TooltipSupport';

class List extends LabelSupport {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				margin: 6px 0;
				padding-left: 32px;

				li {
					line-height: 1.3;
					text-indent: 6px;
				}

				${options.styles ? options.styles(theme) : ''}
			`,
			tag: 'ul',
			appendChildren: [
				...(options.appendChildren || []),
				...(options.appendChild ? [options.appendChild] : []),
				...(options.items || []).map(
					item =>
						new TooltipSupport({
							tag: 'li',
							...item,
						}),
				),
			],
		});
	}
}

export default List;
