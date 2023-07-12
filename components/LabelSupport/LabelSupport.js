import { TooltipSupport } from '../TooltipSupport';
import { Label } from '../Label';

/** A DomElem with support for a label */
class LabelSupport extends TooltipSupport {
	/**
	 * Create a DomElem component with LabelSupport
	 * @param {Object} options - The options for initializing the component
	 * @param {(String|Array|Object)} options.label - The content used for the label element
	 */
	constructor(options = {}) {
		const appendChildrenArray = Array.isArray(options.appendChildren)
			? options.appendChildren
			: [options.appendChildren];
		const children = [
			...(options.appendChildren ? appendChildrenArray : []),
			...(options.appendChild ? [options.appendChild] : []),
		];

		super({
			...options,
			tooltip: options.label ? undefined : options.tooltip,
			appendChildren: options.label ? undefined : children,
		});

		this.elem.id = this.classId;
		this.children = children;
	}

	setOption(name, value) {
		if (name === 'label') {
			if (this._label) this._label.setOption(name, value);
			else {
				requestAnimationFrame(() => {
					this._label = new Label({
						for: this.elem.id,
						label: this.options.label,
						tooltip: this.options.tooltip,
						appendTo: this.elem.parentElement,
						appendChildren: [
							this.elem,
							...this.children,
							...(Array.isArray(this.options.appendToLabel)
								? this.options.appendToLabel
								: [this.options.appendToLabel]),
						],
					});
				});
			}
		} else if (name === 'tooltip' && this._label) this._label.setOption(name, value);
		else super.setOption(name, value);
	}
}

export default LabelSupport;
