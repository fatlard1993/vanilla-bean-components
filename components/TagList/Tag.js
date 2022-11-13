import './index.css';

import DomElem from '../DomElem';
import IconButton from '../IconButton';

export class Tag extends DomElem {
	constructor({ appendTo, readOnly = false, ...options }) {
		const onPointerPress = () => {
			if (this.removeButton) {
				this.removeButton.remove();
				this.removeButton = undefined;
			} else this.removeButton = new IconButton({ icon: 'close', appendTo: this, onPointerPress: () => this.remove() });
		};

		super({
			tag: 'li',
			appendTo,
			onPointerPress: readOnly ? () => {} : onPointerPress,
			...options,
		});
	}
}

export default Tag;
