/* This file is automatically managed (bun build:index) (updateDemoViewIndex.js), do not edit by hand */

import { styled } from '../styled/styled.js';

import ButtonDemo from '../components/Button/demo.js';
import CalendarDemo from '../components/Calendar/demo.js';
import CodeDemo from '../components/Code/demo.js';
import ColorPickerDemo from '../components/ColorPicker/demo.js';
import DialogDemo from '../components/Dialog/demo.js';
import FormDemo from '../components/Form/demo.js';
import IconDemo from '../components/Icon/demo.js';
import InputDemo from '../components/Input/demo.js';
import KeyboardDemo from '../components/Keyboard/demo.js';
import LabelDemo from '../components/Label/demo.js';
import LinkDemo from '../components/Link/demo.js';
import ListDemo from '../components/List/demo.js';
import MenuDemo from '../components/Menu/demo.js';
import NotifyDemo from '../components/Notify/demo.js';
import PageDemo from '../components/Page/demo.js';
import PopoverDemo from '../components/Popover/demo.js';
import RadioButtonDemo from '../components/RadioButton/demo.js';
import RouterDemo from '../components/Router/demo.js';
import SelectDemo from '../components/Select/demo.js';
import TableDemo from '../components/Table/demo.js';
import TagListDemo from '../components/TagList/demo.js';
import TooltipDemo from '../components/Tooltip/demo.js';
import TooltipWrapperDemo from '../components/TooltipWrapper/demo.js';
import WhiteboardDemo from '../components/Whiteboard/demo.js';

import BlogExample from './examples/Blog';
import BombGameExample from './examples/BombGame';
import CalculatorExample from './examples/Calculator';
import CounterExample from './examples/Counter';
import DataTableExample from './examples/DataTable';
import DlcWhiteboardExample from './examples/DlcWhiteboard';
import MultiWidgetExample from './examples/MultiWidget';
import PlaygroundExample from './examples/Playground';
import ShapeMatchGameExample from './examples/ShapeMatchGame';
import StopwatchExample from './examples/Stopwatch';
import TodoExample from './examples/Todo';

import DocumentationView from './DemoView/DocumentationView.js';

const startDocumentation = styled(DocumentationView, () => '', {
	fileName: 'docs/GETTING_STARTED.md',
	nextLabel: 'Elem',
	nextUrl: '#/documentation/Elem',
});
const MarkdownDocumentation = styled(DocumentationView, () => '', { folderName: 'markdown' });
const ComponentDocumentation = styled(DocumentationView, () => '', {
	folderName: 'Component',
	nextLabel: 'Context',
	nextUrl: '#/documentation/Context',
});
const ContextDocumentation = styled(DocumentationView, () => '', {
	folderName: 'Context',
	nextLabel: 'styled',
	nextUrl: '#/documentation/styled',
});
const demoDocumentation = styled(DocumentationView, () => '', {
	folderName: 'demo',
	nextLabel: 'Getting Started',
	nextUrl: '#/documentation/start',
});
const ElemDocumentation = styled(DocumentationView, () => '', {
	folderName: 'Elem',
	nextLabel: 'Component',
	nextUrl: '#/documentation/Component',
});
const requestDocumentation = styled(DocumentationView, () => '', { folderName: 'request' });
const styledDocumentation = styled(DocumentationView, () => '', {
	folderName: 'styled',
	nextLabel: 'theme',
	nextUrl: '#/documentation/theme',
});
const themeDocumentation = styled(DocumentationView, () => '', {
	folderName: 'theme',
	nextLabel: 'request',
	nextUrl: '#/documentation/request',
});

export default {
	['/Button']: ButtonDemo,
	['/Calendar']: CalendarDemo,
	['/Code']: CodeDemo,
	['/ColorPicker']: ColorPickerDemo,
	['/Dialog']: DialogDemo,
	['/Form']: FormDemo,
	['/Icon']: IconDemo,
	['/Input']: InputDemo,
	['/Keyboard']: KeyboardDemo,
	['/Label']: LabelDemo,
	['/Link']: LinkDemo,
	['/List']: ListDemo,
	['/Menu']: MenuDemo,
	['/Notify']: NotifyDemo,
	['/Page']: PageDemo,
	['/Popover']: PopoverDemo,
	['/RadioButton']: RadioButtonDemo,
	['/Router']: RouterDemo,
	['/Select']: SelectDemo,
	['/Table']: TableDemo,
	['/TagList']: TagListDemo,
	['/Tooltip']: TooltipDemo,
	['/TooltipWrapper']: TooltipWrapperDemo,
	['/Whiteboard']: WhiteboardDemo,

	['/examples/Blog']: BlogExample,
	['/examples/BombGame']: BombGameExample,
	['/examples/Calculator']: CalculatorExample,
	['/examples/Counter']: CounterExample,
	['/examples/DataTable']: DataTableExample,
	['/examples/DlcWhiteboard']: DlcWhiteboardExample,
	['/examples/MultiWidget']: MultiWidgetExample,
	['/examples/Playground']: PlaygroundExample,
	['/examples/ShapeMatchGame']: ShapeMatchGameExample,
	['/examples/Stopwatch']: StopwatchExample,
	['/examples/Todo']: TodoExample,

	['/documentation/start']: startDocumentation,
	['/documentation/markdown']: MarkdownDocumentation,
	['/documentation/Component']: ComponentDocumentation,
	['/documentation/Context']: ContextDocumentation,
	['/documentation/demo']: demoDocumentation,
	['/documentation/Elem']: ElemDocumentation,
	['/documentation/request']: requestDocumentation,
	['/documentation/styled']: styledDocumentation,
	['/documentation/theme']: themeDocumentation,
};
