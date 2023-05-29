import { TooltipSupport } from '../Tooltip';

export class Button extends TooltipSupport {
	constructor({ styles = () => '', icon, className, ...options }) {
		super({
			styles: theme => `
				${theme.button}

				${styles(theme)}
			`,
			tag: 'button',
			className: [...(icon ? [`fa-${icon}`] : []), className],
			...options,
		});
	}
}

export default Button;
