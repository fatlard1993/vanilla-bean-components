import { DomElem, Icon, delay } from '../..';

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
			styles: (theme, domElem) => `
				font-size: 66px;
				display: flex;
				justify-content: center;
				color: ${theme.colors.blue};

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}
}

class PostHeading extends DomElem {
	constructor(content) {
		super({
			tag: 'h2',
			content,
			styles: ({ colors }) => `
				font-size: 3em;
				margin: 0 0 18px 0;
				color: ${colors.blue};
			`,
		});
	}
}

class PostBody extends DomElem {
	constructor(content) {
		super({
			tag: 'p',
			content,
			styles: () => `
				text-indent: 6px;
			`,
		});
	}
}

class Post extends DomElem {
	constructor(options) {
		super({
			tag: 'p',
			content: [new PostHeading(options.heading), new PostBody(options.body)],
			...options,
			styles: (theme, domElem) => `
				padding: 12px;
				border: 1px solid ${theme.colors.blue};

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}
}

class Blog extends DomElem {
	setOption(key, value) {
		if (key === 'posts') this.content(value.map(post => new Post(post)));
		else super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	async render(options = this.options) {
		super.render(options);

		const wrapper = new DemoWrapper({ appendTo: this }, new Loader());

		const posts = await fetchPosts();

		wrapper.content(new Blog({ posts }));
	}
}
