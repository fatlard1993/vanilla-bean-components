import DomElem from '../DomElem';

export class Button extends DomElem {
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
