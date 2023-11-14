import { Input } from '../Input';

const defaultOptions = { tag: 'textarea', height: 'auto' };

class Textarea extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	setOption(key, value) {
		if (key === 'height') {
			if (value === 'auto') {
				this.__updateAutoHeight = () => {
					this.elem.style.height = `${(this.elem.value?.match(/\n/g) || '').length + 2}em`;
				};

				this.__updateAutoHeight();

				this.elem.addEventListener('input', this.__updateAutoHeight);
			} else {
				this.elem.removeEventListener('input', this.__updateAutoHeight);

				this.elem.style.height = typeof value === 'number' ? `${value + 1}em` : value;
			}
		} else super.setOption(key, value);
	}
}

export default Textarea;
