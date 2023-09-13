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
				this.updateAutoHeight();

				this.elem.addEventListener('input', this.updateAutoHeight);
			} else {
				this.elem.removeEventListener('input', this.updateAutoHeight);

				this.style.height = typeof value === 'number' ? `${value + 1}em` : value;
			}
		} else super.setOption(key, value);
	}

	updateAutoHeight() {
		this.style.height = `${(this.value.match(/\n/g) || '').length + 2}em`;
	}
}

export default Textarea;
