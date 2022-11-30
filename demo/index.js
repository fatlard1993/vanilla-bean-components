import { Page } from '../';

import DemoRouter from './DemoRouter';

new Page({ appendTo: document.getElementById('app'), appendChild: new DemoRouter() });
