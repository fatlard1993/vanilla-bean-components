import { TooltipSupport } from '../TooltipSupport';

class NoData extends TooltipSupport {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				margin: 6px auto;
				padding: 6px 12px;
				text-align: center;

				${options.styles?.(theme) || ''}
			`,
		});
	}
}

export default NoData;
