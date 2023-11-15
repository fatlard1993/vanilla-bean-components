import { Input } from '../Input';

const defaultOptions = { type: 'search', placeholder: 'Search' };

class Search extends Input {
	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	onSearch(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.elem.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('search', wrappedCallback);

		return () => this.elem.removeEventListener('search', wrappedCallback);
	}
}

export default Search;
