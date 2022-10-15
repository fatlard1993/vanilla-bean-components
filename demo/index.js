import { Page } from '../';

import Router from './Router';

new Page({ appendTo: document.getElementById('app'), appendChild: new Router().elem });
