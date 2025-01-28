import { Component, Icon, delay } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Blog.js.asText';

const fetchPosts = async () => {
	await delay(2000);

	return [
		{ heading: 'Hello World', body: 'This is my first post!' },
		{ heading: 'New Stuff', body: 'Look! More content for this neat blog!' },
	];
};

class Loader extends Icon {
	constructor(options = {}) {
		super({
			icon: 'spinner',
			animation: 'spin-pulse',
			...options,
			styles: ({ colors }) => ({
				fontSize: '66px',
				display: 'flex',
				justifyContent: 'center',
				color: colors.blue,
			}),
		});
	}
}

class PostHeading extends Component {
	constructor(content) {
		super({
			tag: 'h2',
			content,
			styles: ({ colors }) => ({
				fontSize: '3em',
				margin: '0 0 18px 0',
				color: colors.blue,
			}),
		});
	}
}

class PostBody extends Component {
	constructor(content) {
		super({
			tag: 'p',
			content,
			style: { textIndent: '6px' },
		});
	}
}

class Post extends Component {
	constructor(options) {
		super({
			tag: 'p',
			content: [new PostHeading(options.heading), new PostBody(options.body)],
			...options,
			styles: ({ colors }) => ({
				padding: '12px',
				border: `1px solid ${colors.blue}`,
			}),
		});
	}
}

class Blog extends Component {
	_setOption(key, value) {
		if (key === 'posts') this.content(value.map(post => new Post(post)));
		else super._setOption(key, value);
	}
}

export default class Example extends ExampleView {
	async render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Loader({ appendTo: this.demoWrapper });

		const posts = await fetchPosts();

		this.demoWrapper.content(new Blog({ posts }));
	}
}
