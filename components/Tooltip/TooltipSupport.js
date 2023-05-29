import DomElem from '../DomElem';
import Tooltip from '.';

export class TooltipSupport extends DomElem {
	constructor({ styles = () => '', icon, className, tooltip, ...options }) {
		super({
			styles: theme => `
				${
					tooltip
						? `
							&:hover {
								overflow: visible;

								.tooltip {
									display: block;
								}
							}
						`
						: ''
				}

				${styles(theme)}
			`,
			className: [...(icon ? [`fa-${icon}`] : []), className],
			...options,
		});

		if (tooltip) {
			this.tooltip = new Tooltip({
				appendTo: this.elem,
				...(typeof tooltip === 'object' ? tooltip : { textContent: tooltip }),
			});
		}
	}
}

export default TooltipSupport;
