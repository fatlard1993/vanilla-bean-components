import { Component, Icon, delay } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

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
	setOption(key, value) {
		if (key === 'posts') this.content(value.map(post => new Post(post)));
		else super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	async render() {
		super.render();

		const wrapper = new DemoWrapper({ appendTo: this }, new Loader());

		const posts = await fetchPosts();

		wrapper.content(new Blog({ posts }));
	}
}
