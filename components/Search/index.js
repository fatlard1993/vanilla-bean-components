import './index.css';

import TextInput from '../TextInput';

export default class Search extends TextInput {
	constructor({ className, ...rest } = {}) {
		super({
			className: ['search', className],
			placeholder: 'Search',
			...rest,
		});
	}
}
