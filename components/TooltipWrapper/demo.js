import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { TooltipWrapper } from '.';

export default class Demo extends DemoView {
	render() {
		this.box = new Component({
			style: { border: `2px solid red`, height: '200px', width: '200px' },
		});

		this.component = new TooltipWrapper({
			content: 'Some content',
			tooltip: { content: 'Some tooltip content', viewport: this.box },
			appendTo: this.box,
		});

		super.render();
	}
}
