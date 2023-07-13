import ButtonDemo from '../components/Button/demo';
import ColorPickerDemo from '../components/ColorPicker/demo';
import CheckboxDemo from '../components/Checkbox/demo';
import CodeDemo from '../components/Code/demo';
import DialogDemo from '../components/Dialog/demo';
import DomElemDemo from '../components/DomElem/demo';
import IconButtonDemo from '../components/IconButton/demo';
import IconDemo from '../components/Icon/demo';
import InputDemo from '../components/Input/demo';
import LabelDemo from '../components/Label/demo';
import LabelSupportDemo from '../components/LabelSupport/demo';
import LinkDemo from '../components/Link/demo';
import ListDemo from '../components/List/demo';
import MenuDemo from '../components/Menu/demo';
import NoDataDemo from '../components/NoData/demo';
import NumberInputDemo from '../components/NumberInput/demo';
import PageDemo from '../components/Page/demo';
import RadioButtonDemo from '../components/RadioButton/demo';
import OverlayDemo from '../components/Overlay/demo';
import RouterDemo from '../components/Router/demo';
import SearchDemo from '../components/Search/demo';
import SelectDemo from '../components/Select/demo';
import TagListDemo from '../components/TagList/demo';
import TextareaDemo from '../components/Textarea/demo';
import TextInputDemo from '../components/TextInput/demo';
import TooltipDemo from '../components/Tooltip/demo';
import TooltipSupportDemo from '../components/TooltipSupport/demo';
import ViewDemo from '../components/View/demo';

import { NoData, Router } from '../components';
import DemoView from './DemoView';

class NotFound extends DemoView {
	constructor({ route, ...options }) {
		super(options);

		new NoData({ textContent: `Could not find route ${route}`, appendTo: this.demoWrapper });
	}
}

export const paths = {
	button: '/Button',
	colorPicker: '/ColorPicker',
	checkbox: '/Checkbox',
	code: '/Code',
	dialog: '/Dialog',
	domElem: '/DomElem',
	iconButton: '/IconButton',
	Icon: '/Icon',
	input: '/Input',
	label: '/Label',
	labelSupport: '/LabelSupport',
	link: '/Link',
	list: '/List',
	menu: '/Menu',
	noData: '/NoData',
	numberInput: '/NumberInput',
	overlay: '/Overlay',
	page: '/Page',
	radioButton: '/RadioButton',
	router: '/Router',
	search: '/Search',
	select: '/Select',
	tagList: '/TagList',
	textarea: '/Textarea',
	textInput: '/TextInput',
	tooltip: '/Tooltip',
	tooltipSupport: '/TooltipSupport',
	view: '/View',
};

const views = {
	[paths.button]: ButtonDemo,
	[paths.colorPicker]: ColorPickerDemo,
	[paths.checkbox]: CheckboxDemo,
	[paths.code]: CodeDemo,
	[paths.dialog]: DialogDemo,
	[paths.domElem]: DomElemDemo,
	[paths.iconButton]: IconButtonDemo,
	[paths.Icon]: IconDemo,
	[paths.input]: InputDemo,
	[paths.label]: LabelDemo,
	[paths.labelSupport]: LabelSupportDemo,
	[paths.link]: LinkDemo,
	[paths.list]: ListDemo,
	[paths.menu]: MenuDemo,
	[paths.noData]: NoDataDemo,
	[paths.numberInput]: NumberInputDemo,
	[paths.overlay]: OverlayDemo,
	[paths.page]: PageDemo,
	[paths.radioButton]: RadioButtonDemo,
	[paths.router]: RouterDemo,
	[paths.search]: SearchDemo,
	[paths.select]: SelectDemo,
	[paths.tagList]: TagListDemo,
	[paths.textarea]: TextareaDemo,
	[paths.textInput]: TextInputDemo,
	[paths.tooltip]: TooltipDemo,
	[paths.tooltipSupport]: TooltipSupportDemo,
	[paths.view]: ViewDemo,
};

export default class DemoRouter extends Router {
	constructor() {
		super({ views, notFound: NotFound });
	}
}
