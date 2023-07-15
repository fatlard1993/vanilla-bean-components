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
		super({
			...options,
			tooltip: options.label ? undefined : options.tooltip,
			append: options.label ? undefined : options.append,
		});

		this.elem.id = this.classId;
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
						...this.options.labelOptions,
						append: [this.elem, ...(this.options.append || []), ...(this.options.labelOptions?.append || [])],
					});
				});
			}
		} else if (name === 'tooltip' && this._label) this._label.setOption(name, value);
		else if (name === 'labelOptions' && this._label) this._label.setOptions(value);
		else super.setOption(name, value);
	}
}

export default LabelSupport;
