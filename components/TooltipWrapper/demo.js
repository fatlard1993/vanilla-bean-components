import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Component } from '../../Component';
import { TooltipWrapper } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.box = new Component({
			style: { border: `2px solid red`, height: '200px', width: '200px' },
			appendTo: this.demoWrapper,
		});

		this.component = new TooltipWrapper({
			content: 'Some content',
			tooltip: { content: 'Some tooltip content', viewport: this.box },
			appendTo: this.box,
		});

		super.render();
	}
}
