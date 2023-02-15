import process from 'process';
import { Page } from '../';

import DemoRouter from './DemoRouter';

window.process = process;

new Page({ appendTo: document.getElementById('app'), appendChild: new DemoRouter() });
