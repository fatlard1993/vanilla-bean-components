import ButtonDemo from '../components/Button/demo';
import ColorPickerDemo from '../components/ColorPicker/demo';
import DialogDemo from '../components/Dialog/demo';
import DomElemDemo from '../components/DomElem/demo';
import IconButtonDemo from '../components/IconButton/demo';
import LabelDemo from '../components/Label/demo';
import LinkDemo from '../components/Link/demo';
import MenuDemo from '../components/Menu/demo';
import ModalDemo from '../components/Modal/demo';
import ModalDialogDemo from '../components/ModalDialog/demo';
import NoDataDemo from '../components/NoData/demo';
import NumberInputDemo from '../components/NumberInput/demo';
import PageDemo from '../components/Page/demo';
import OverlayDemo from '../components/Overlay/demo';
import RouterDemo from '../components/Router/demo';
import SearchDemo from '../components/Search/demo';
import SelectDemo from '../components/Select/demo';
import TagDemo from '../components/Tag/demo';
import TagListDemo from '../components/TagList/demo';
import TextareaDemo from '../components/Textarea/demo';
import TextInputDemo from '../components/TextInput/demo';
import ViewDemo from '../components/View/demo';

import Router from '../components/Router';

export const paths = {
	button: '/Button',
	colorPicker: '/ColorPicker',
	dialog: '/Dialog',
	domElem: '/DomElem',
	iconButton: '/IconButton',
	label: '/Label',
	link: '/Link',
	menu: '/Menu',
	modal: '/Modal',
	modalDialog: '/ModalDialog',
	noData: '/NoData',
	numberInput: '/NumberInput',
	overlay: '/Overlay',
	page: '/Page',
	router: '/Router',
	search: '/Search',
	select: '/Select',
	tag: '/Tag',
	tagList: '/TagList',
	textarea: '/Textarea',
	textInput: '/TextInput',
	view: '/View',
};

export const views = {
	[paths.button]: ButtonDemo,
	[paths.colorPicker]: ColorPickerDemo,
	[paths.dialog]: DialogDemo,
	[paths.domElem]: DomElemDemo,
	[paths.iconButton]: IconButtonDemo,
	[paths.label]: LabelDemo,
	[paths.link]: LinkDemo,
	[paths.menu]: MenuDemo,
	[paths.modal]: ModalDemo,
	[paths.modalDialog]: ModalDialogDemo,
	[paths.noData]: NoDataDemo,
	[paths.numberInput]: NumberInputDemo,
	[paths.overlay]: OverlayDemo,
	[paths.page]: PageDemo,
	[paths.router]: RouterDemo,
	[paths.search]: SearchDemo,
	[paths.select]: SelectDemo,
	[paths.tag]: TagDemo,
	[paths.tagList]: TagListDemo,
	[paths.textarea]: TextareaDemo,
	[paths.textInput]: TextInputDemo,
	[paths.view]: ViewDemo,
};

export default class DemoRouter extends Router {
	constructor(options) {
		super({ views, paths, defaultPath: paths.button, ...options });
	}
}
