import Button from '../../components/Button/demo';
import ColorPicker from '../../components/ColorPicker/demo';
import Dialog from '../../components/Dialog/demo';
import DomElem from '../../components/DomElem/demo';
import IconButton from '../../components/IconButton/demo';
import Label from '../../components/Label/demo';
import Link from '../../components/Link/demo';
import Menu from '../../components/Menu/demo';
import Modal from '../../components/Modal/demo';
import NoData from '../../components/NoData/demo';
import NumberInput from '../../components/NumberInput/demo';
import Popover from '../../components/Popover/demo';
import Search from '../../components/Search/demo';
import Select from '../../components/Select/demo';
import Tag from '../../components/Tag/demo';
import TagList from '../../components/TagList/demo';
import Textarea from '../../components/Textarea/demo';
import TextInput from '../../components/TextInput/demo';

import Router from '../../utils/Router';

import { paths } from './constants';

export { paths };

export const views = {
	[paths.button]: Button,
	[paths.colorPicker]: ColorPicker,
	[paths.dialog]: Dialog,
	[paths.domElem]: DomElem,
	[paths.iconButton]: IconButton,
	[paths.label]: Label,
	[paths.link]: Link,
	[paths.menu]: Menu,
	[paths.modal]: Modal,
	[paths.noData]: NoData,
	[paths.numberInput]: NumberInput,
	[paths.popover]: Popover,
	[paths.search]: Search,
	[paths.select]: Select,
	[paths.tag]: Tag,
	[paths.tagList]: TagList,
	[paths.textarea]: Textarea,
	[paths.textInput]: TextInput,
};

export const router = new Router({
	appendTo: document.getElementById('app'),
	defaultPath: paths.button,
	views,
});

export default router;
