import DemoView, { DemoWrapper } from '../../demo/DemoView';

import theme from '../../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { ColorPicker } from '../ColorPicker';
import { Popover } from '../Popover';

import { Whiteboard } from '.';

export default class Demo extends DemoView {
	render() {
		const size = document.body.clientWidth - document.body.clientWidth * 0.22;

		this.component = new Whiteboard({
			width: `${size}px`,
			height: `${size / 2}px`,
			color: JSON.parse(localStorage.getItem('last_whiteboard_line_color') || '"#000"'),
			lineWidth: JSON.parse(localStorage.getItem('last_whiteboard_line_size') || 3),
			lines: JSON.parse(localStorage.getItem('last_whiteboard_lines') || '[]'),
			onChange: ({ detail }) => {
				console.log(detail);

				this.component.options.lines = [...this.component.options.lines, detail];

				localStorage.setItem('last_whiteboard_lines', JSON.stringify(this.component.options.lines));
			},
		});

		const colorPicker = new Popover(
			{
				style: { background: 'none', border: 'none', padding: 0, margin: '-6px' },
				appendTo: this,
				autoOpen: false,
			},
			new ColorPicker(
				{
					value: this.component.options.color,
					onChange: ({ value }) => {
						this.component.options.color = value;

						localStorage.setItem('last_whiteboard_line_color', JSON.stringify(value));
					},
					swatches: ['white', 'black', this.component.options.color, 'random'],
				},
				new Input({
					type: 'number',
					value: this.component.options.lineWidth,
					onChange: ({ value }) => {
						this.component.options.lineWidth = value;

						localStorage.setItem('last_whiteboard_line_size', JSON.stringify(this.component.options.lineWidth));
					},
				}),
			),
		);

		const colorSwatch = new Button({
			icon: 'paintbrush',
			style: this.component.options.subscriber('color', backgroundColor => ({
				backgroundColor,
				color: theme.colors.mostReadable(backgroundColor, [theme.colors.white, theme.colors.black]),
			})),
			appendTo: this.demoWrapper,
			onPointerPress: event => colorPicker.show({ x: event.clientX, y: event.clientY, maxHeight: 378, maxWidth: 318 }),
		});

		const trash = new Button({
			icon: 'trash-can',
			style: { backgroundColor: theme.colors.red },
			appendTo: this.demoWrapper,
			onPointerPress: () => {
				this.component.options.lines = [];
				localStorage.removeItem('last_whiteboard_lines');
				this.component.empty();
			},
		});

		this.demoWrapper = new DemoWrapper({ appendTo: this, content: [this.component, colorSwatch, trash] });

		super.render();
	}
}
