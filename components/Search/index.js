import './index.css';

import Input from '../Input';

export class Search extends Input {
	constructor(options) {
		super({
			type: 'search',
			placeholder: 'Search',
			...options,
		});
	}
}

export default Search;
