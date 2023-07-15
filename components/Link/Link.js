import { Button } from '../Button';

const defaultOptions = { tag: 'a', tooltip: { icon: 'link' } };

class Link extends Button {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
			styles: theme => `
				&.disabled {
					pointer-events: none;

					&:hover .tooltip {
						display: none;
					}
				}

				${options.styles?.(theme) || ''}
			`,
		});
	}
}

export default Link;
