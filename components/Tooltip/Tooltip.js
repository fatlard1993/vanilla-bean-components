import DomElem from '../DomElem';

export class Tooltip extends DomElem {
	constructor({ styles = () => '', position = 'topRight', icon, className, ...options }) {
		super({
			styles: theme => `
				${icon ? theme.fonts.fontAwesomeSolid : ''}
				display: none;
				position: absolute;
				padding: 3px;
				z-index: 1;
				border-radius: 3px;
				pointer-events: none;
				max-width: 200px;
				background-color: ${theme.colors.white};
				color: ${theme.colors.black};
				${
					{
						top: 'left: 50%; bottom: calc(100% - 3px); transform: translateX(-50%);',
						bottom: 'left: 50%; top: calc(100% - 3px); transform: translateX(-50%);',
						left: 'top: 2px; right: calc(100% + 2px);',
						right: 'top: 2px; left: calc(100% + 2px);',
						topLeft: 'right: calc(100% - 9px); bottom: calc(100% - 9px);',
						topRight: 'left: calc(100% - 9px); bottom: calc(100% - 9px);',
						bottomLeft: 'right: calc(100% - 9px); top: calc(100% - 9px);',
						bottomRight: 'left: calc(100% - 9px); top: calc(100% - 9px);',
					}[position] || ''
				}

				${styles(theme)}
			`,
			className: ['tooltip', ...(icon ? [`fa-${icon}`] : []), className],
			...options,
		});
	}
}

export default Tooltip;
