import Input from '../Input';

export class Search extends Input {
	constructor(options) {
		super({
			type: 'search',
			placeholder: 'Search',
			...options,
		});
	}

	onSearch(cb) {
		const wrappedCb = evt => {
			evt.value = evt.target.value || this.elem.value || this.value;

			cb(evt);
		};

		this.elem.addEventListener('search', wrappedCb);

		return () => this.elem.removeEventListener('search', wrappedCb);
	}
}

export default Search;
