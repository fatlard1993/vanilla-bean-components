import './index.css';

import TextInput from '../TextInput';

export class Search extends TextInput {
	constructor(options) {
		super({
			placeholder: 'Search',
			...options,
		});
	}
}

export default Search;
