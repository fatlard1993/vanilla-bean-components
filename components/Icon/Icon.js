import { Component } from '../../Component';

export default class Icon extends Component {
	setOption(key, value) {
		if (key === 'icon' || key === 'animation') {
			this.removeClass(/\bfa-\S+?\b/g);

			if (value) {
				this.addClass(
					...(this.options.content || this.options.textContent ? [] : ['icon']),
					...['support', this.options[key === 'icon' ? 'animation' : 'icon'], value]
						.filter(_ => !!_)
						.map(_ => `fa-${_}`),
				);
			}
		} else super.setOption(key, value);
	}
}
