import { DomElem, Router, View } from '../components';

import ButtonDemo from '../components/Button/demo';
import CalendarDemo from '../components/Calendar/demo';
import CheckboxDemo from '../components/Checkbox/demo';
import CodeDemo from '../components/Code/demo';
import ColorPickerDemo from '../components/ColorPicker/demo';
import DialogDemo from '../components/Dialog/demo';
import DomElemDemo from '../components/DomElem/demo';
import FormDemo from '../components/Form/demo';
import IconDemo from '../components/Icon/demo';
import InputDemo from '../components/Input/demo';
import KeyboardDemo from '../components/Keyboard/demo';
import LabelDemo from '../components/Label/demo';
import LinkDemo from '../components/Link/demo';
import ListDemo from '../components/List/demo';
import MenuDemo from '../components/Menu/demo';
import PageDemo from '../components/Page/demo';
import RadioButtonDemo from '../components/RadioButton/demo';
import NotifyDemo from '../components/Notify/demo';
import PopoverDemo from '../components/Popover/demo';
import RouterDemo from '../components/Router/demo';
import SearchDemo from '../components/Search/demo';
import SelectDemo from '../components/Select/demo';
import TagListDemo from '../components/TagList/demo';
import TextareaDemo from '../components/Textarea/demo';
import TooltipDemo from '../components/Tooltip/demo';
import TooltipWrapperDemo from '../components/TooltipWrapper/demo';

import BlogExample from './examples/Blog';
import CounterExample from './examples/Counter';
import BombGameExample from './examples/BombGame';
import MultiWidgetExample from './examples/MultiWidget';
import StopwatchExample from './examples/Stopwatch';
import CalculatorExample from './examples/Calculator';
import TodoExample from './examples/Todo';

class NotFound extends View {
	render() {
		new DomElem({
			styles: () => `
				margin: 6px auto;
				padding: 6px 12px;
				text-align: center;
			`,
			textContent: `Could not find route "${this.options.route}"`,
			appendTo: this,
		});

		super.render();
	}
}

export const views = {
	['/Button']: ButtonDemo,
	['/Calendar']: CalendarDemo,
	['/Checkbox']: CheckboxDemo,
	['/Code']: CodeDemo,
	['/ColorPicker']: ColorPickerDemo,
	['/Dialog']: DialogDemo,
	['/DomElem']: DomElemDemo,
	['/Form']: FormDemo,
	['/Icon']: IconDemo,
	['/Input']: InputDemo,
	['/Keyboard']: KeyboardDemo,
	['/Label']: LabelDemo,
	['/Link']: LinkDemo,
	['/List']: ListDemo,
	['/Menu']: MenuDemo,
	['/Notify']: NotifyDemo,
	['/Popover']: PopoverDemo,
	['/Page']: PageDemo,
	['/RadioButton']: RadioButtonDemo,
	['/Router']: RouterDemo,
	['/Search']: SearchDemo,
	['/Select']: SelectDemo,
	['/TagList']: TagListDemo,
	['/Textarea']: TextareaDemo,
	['/Tooltip']: TooltipDemo,
	['/TooltipWrapper']: TooltipWrapperDemo,
	['/examples/Blog']: BlogExample,
	['/examples/Counter']: CounterExample,
	['/examples/Stopwatch']: StopwatchExample,
	['/examples/MultiWidget']: MultiWidgetExample,
	['/examples/BombGame']: BombGameExample,
	['/examples/Calculator']: CalculatorExample,
	['/examples/Todo']: TodoExample,
};

export default class DemoRouter extends Router {
	constructor(options) {
		super({ views, notFound: NotFound, ...options });
	}
}
