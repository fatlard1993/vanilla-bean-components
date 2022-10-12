const dom = {
	isIOS: () => navigator.platform && /iP(hone|ad)/.test(navigator.platform),
	isSafari: () => navigator.vendor === 'Apple Computer, Inc.' && !navigator.userAgent.match('CriOS'),
	onLoad: func => {
		dom.onLoader = func;

		navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

		if (document.readyState !== 'loading') dom.onLoaded();
		else document.addEventListener('DOMContentLoaded', dom.onLoaded);

		const n = null;

		dom.interact.keyMap = [
			n,
			n,
			n,
			'CANCEL',
			n,
			n,
			'HELP',
			n,
			'BACK_SPACE',
			'TAB',
			n,
			n,
			'CLEAR',
			'ENTER',
			'ENTER_SPECIAL',
			n,
			'SHIFT',
			'CONTROL',
			'ALT',
			'PAUSE',
			'CAPS_LOCK',
			'KANA',
			'EISU',
			'JUNJA',
			'FINAL',
			'HANJA',
			n,
			'ESCAPE',
			'CONVERT',
			'NONCONVERT',
			'ACCEPT',
			'MODECHANGE',
			'SPACE',
			'PAGE_UP',
			'PAGE_DOWN',
			'END',
			'HOME',
			'LEFT',
			'UP',
			'RIGHT',
			'DOWN',
			'SELECT',
			'PRINT',
			'EXECUTE',
			'PRINTSCREEN',
			'INSERT',
			'DELETE',
			n,
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'COLON',
			'SEMICOLON',
			'LESS_THAN',
			'EQUALS',
			'GREATER_THAN',
			'QUESTION_MARK',
			'AT',
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G',
			'H',
			'I',
			'J',
			'K',
			'L',
			'M',
			'N',
			'O',
			'P',
			'Q',
			'R',
			'S',
			'T',
			'U',
			'V',
			'W',
			'X',
			'Y',
			'Z',
			'OS_KEY',
			n,
			'CONTEXT_MENU',
			n,
			'SLEEP',
			'NUMPAD0',
			'NUMPAD1',
			'NUMPAD2',
			'NUMPAD3',
			'NUMPAD4',
			'NUMPAD5',
			'NUMPAD6',
			'NUMPAD7',
			'NUMPAD8',
			'NUMPAD9',
			'MULTIPLY',
			'ADD',
			'SEPARATOR',
			'SUBTRACT',
			'DECIMAL',
			'DIVIDE',
			'F1',
			'F2',
			'F3',
			'F4',
			'F5',
			'F6',
			'F7',
			'F8',
			'F9',
			'F10',
			'F11',
			'F12',
			'F13',
			'F14',
			'F15',
			'F16',
			'F17',
			'F18',
			'F19',
			'F20',
			'F21',
			'F22',
			'F23',
			'F24',
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			'NUM_LOCK',
			'SCROLL_LOCK',
			'WIN_OEM_FJ_JISHO',
			'WIN_OEM_FJ_MASSHOU',
			'WIN_OEM_FJ_TOUROKU',
			'WIN_OEM_FJ_LOYA',
			'WIN_OEM_FJ_ROYA',
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			'CIRCUMFLEX',
			'EXCLAMATION',
			'DOUBLE_QUOTE',
			'HASH',
			'DOLLAR',
			'PERCENT',
			'AMPERSAND',
			'UNDERSCORE',
			'OPEN_PAREN',
			'CLOSE_PAREN',
			'ASTERISK',
			'PLUS',
			'PIPE',
			'HYPHEN_MINUS',
			'OPEN_CURLY_BRACKET',
			'CLOSE_CURLY_BRACKET',
			'TILDE',
			n,
			n,
			n,
			n,
			'VOLUME_MUTE',
			'VOLUME_DOWN',
			'VOLUME_UP',
			n,
			n,
			'SEMICOLON',
			'EQUALS',
			'COMMA',
			'MINUS',
			'PERIOD',
			'SLASH',
			'BACK_QUOTE',
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			n,
			'OPEN_BRACKET',
			'BACK_SLASH',
			'CLOSE_BRACKET',
			'QUOTE',
			n,
			'META',
			'ALTGR',
			n,
			'WIN_ICO_HELP',
			'WIN_ICO_00',
			n,
			'WIN_ICO_CLEAR',
			n,
			n,
			'WIN_OEM_RESET',
			'WIN_OEM_JUMP',
			'WIN_OEM_PA1',
			'WIN_OEM_PA2',
			'WIN_OEM_PA3',
			'WIN_OEM_WSCTRL',
			'WIN_OEM_CUSEL',
			'WIN_OEM_ATTN',
			'WIN_OEM_FINISH',
			'WIN_OEM_COPY',
			'WIN_OEM_AUTO',
			'WIN_OEM_ENLW',
			'WIN_OEM_BACKTAB',
			'ATTN',
			'CRSEL',
			'EXSEL',
			'EREOF',
			'PLAY',
			'ZOOM',
			n,
			'PA1',
			'WIN_OEM_CLEAR',
			n,
		];

		document.addEventListener('touchstart', dom.interact.pointerDown);
		document.addEventListener('mousedown', dom.interact.pointerDown);
		document.addEventListener('touchend', dom.interact.pointerUp);
		document.addEventListener('touchcancel', dom.interact.pointerUp);
		document.addEventListener('mouseup', dom.interact.pointerUp);

		document.addEventListener('keydown', dom.interact.keyDown);
		document.addEventListener('keyup', dom.interact.keyUp);

		document.addEventListener('change', dom.interact.change);

		window.addEventListener(
			'scroll',
			() => {
				if (dom.interact.touchUpWillFire) delete dom.interact.touchUpWillFire;
			},
			true,
		);

		setTimeout(() => {
			dom.interact.acceptKeyPresses = true;
		}, 200);
	},
	onLoaded: () => {
		if (dom.loaded) return;

		dom.loaded = true;

		dom.onLoader();
	},
	pointerEventPolyfill: evt => {
		if (typeof evt === 'undefined') evt = window.event;

		evt.stop = () => {
			if (evt.cancelable) evt.preventDefault();

			evt.cancelBubble = true;

			if (evt.stopPropagation) evt.stopPropagation();
		};

		evt.pointerType = evt.type.startsWith('mouse') ? 'mouse' : 'touch';

		return evt;
	},
	resolvePosition: evt => {
		return {
			x: evt.changedTouches ? evt.changedTouches[0].pageX : evt.clientX,
			y: evt.changedTouches ? evt.changedTouches[0].pageY : evt.clientY,
		};
	},
	onPointerDown: (elem, func) => {
		const wrappedFunc = evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (dom.isMobile && evt.pointerType !== 'touch') return;

			func.call(elem, evt);
		};

		elem.pointerDownFunction = wrappedFunc;

		elem.addEventListener('touchstart', wrappedFunc);
		elem.addEventListener('mousedown', wrappedFunc);

		elem.pointerDownOff = () => {
			elem.removeEventListener('touchstart', wrappedFunc);
			elem.removeEventListener('mousedown', wrappedFunc);

			delete elem.pointerDownOff;
		};
	},
	onPointerUp: (elem, func) => {
		const wrappedFunc = evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (dom.isMobile && evt.pointerType !== 'touch') return;

			func.call(elem, evt);
		};

		elem.pointerUpFunction = wrappedFunc;

		elem.addEventListener('touchend', wrappedFunc);
		elem.addEventListener('touchcancel', wrappedFunc);
		elem.addEventListener('mouseup', wrappedFunc, true);

		elem.pointerUpOff = () => {
			elem.removeEventListener('touchend', wrappedFunc);
			elem.removeEventListener('touchcancel', wrappedFunc);
			elem.removeEventListener('mouseup', wrappedFunc, true);

			delete elem.pointerUpOff;
		};
	},
	onPointerPress: (elem, func) => {
		const wrappedFunc = evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (elem.pointerUpOff) elem.pointerUpOff();

			if (evt.target !== elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			func.call(elem, evt);
		};

		elem.pointerPressFunction = func.bind(elem);

		elem.pointerDownOff = () => {
			elem.removeEventListener('touchstart', pointerDown);
			elem.removeEventListener('mousedown', pointerDown);

			delete elem.pointerDownOff;
		};

		const pointerDown = evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (evt.target !== elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			document.addEventListener('touchend', wrappedFunc);
			document.addEventListener('touchcancel', wrappedFunc);
			document.addEventListener('mouseup', wrappedFunc, true);

			elem.pointerUpOff = () => {
				document.removeEventListener('touchend', wrappedFunc);
				document.removeEventListener('touchcancel', wrappedFunc);
				document.removeEventListener('mouseup', wrappedFunc, true);

				delete elem.pointerUpOff;
			};
		};

		elem.addEventListener('touchstart', pointerDown);
		elem.addEventListener('mousedown', pointerDown);
	},
	onPointerPressAndHold: (elem, func) => {
		elem.dataset.pressAndHoldTime = elem.dataset.pressAndHoldTime || 900;

		elem.pointerPressAndHoldFunction = func.bind(elem);

		elem.pointerDownOff = () => {
			elem.removeEventListener('touchstart', pointerDown);
			elem.removeEventListener('mousedown', pointerDown);

			delete elem.pointerDownOff;
		};

		const pointerUp = () => {
			elem.pointerUpOff();
		};

		const pointerDown = evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (evt.target !== elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			elem.classList.add('pointerHold');

			elem.holdTimeout = setTimeout(() => {
				func.call(elem, evt);
			}, parseInt(elem.dataset.pressAndHoldTime));

			document.addEventListener('touchend', pointerUp);
			document.addEventListener('touchcancel', pointerUp);
			elem.addEventListener('mouseleave', pointerUp);
			document.addEventListener('mouseup', pointerUp, true);

			elem.pointerUpOff = () => {
				clearTimeout(elem.holdTimeout);

				elem.classList.remove('pointerHold');

				document.removeEventListener('touchend', pointerUp);
				document.removeEventListener('touchcancel', pointerUp);
				elem.removeEventListener('mouseleave', pointerUp);
				document.removeEventListener('mouseup', pointerUp, true);

				delete elem.pointerUpOff;
			};
		};

		elem.addEventListener('touchstart', pointerDown);
		elem.addEventListener('mousedown', pointerDown);
	},
	onKeyDown: (elem, func) => {
		elem.keyDownFunction = func;

		elem.addEventListener('keydown', func);

		elem.keyDownOff = () => {
			elem.removeEventListener('keydown', func);

			delete elem.keyDownOff;
		};
	},
	onKeyUp: (elem, func) => {
		elem.keyUpFunction = func;

		elem.addEventListener('keyup', func);

		elem.keyUpOff = () => {
			elem.removeEventListener('keyup', func);

			delete elem.keyUpOff;
		};
	},
	onChange: (elem, func) => {
		elem.addEventListener('change', evt => {
			evt.value = elem.value;

			func(evt);
		});
	},
	interact: {
		activity: 0,
		pressedKeys: {},
		acceptKeyPresses: false,
		on: (eventName, func) => {
			const eventArrName = `on_${eventName}`;

			dom.interact[eventArrName] = dom.interact[eventArrName] || [];

			dom.interact[eventArrName].push(func);
		},
		triggerEvent: (type, evt) => {
			if (!evt) {
				evt = type;
				type = evt.type;
			}

			const eventName = `on_${type}`;

			if (!dom.interact[eventName]) return;

			for (let x = 0, count = dom.interact[eventName].length; x < count; ++x) {
				dom.interact[eventName][x].call(dom.interact, evt);
			}
		},
		pointerDown: evt => {
			++dom.interact.activity;

			evt = dom.pointerEventPolyfill(evt);

			if ((dom.isMobile && evt.pointerType !== 'touch') || typeof evt.target.className !== 'string') return;

			if (evt.pointerType === 'touch') dom.interact.touchUpWillFire = true;

			dom.interact.triggerEvent('pointerDown', evt);
		},
		pointerUp: evt => {
			evt = dom.pointerEventPolyfill(evt);

			if (
				(dom.isMobile && evt.pointerType !== 'touch') ||
				typeof evt.target.className !== 'string' ||
				(evt.pointerType === 'touch' && !dom.interact.touchUpWillFire)
			)
				return;

			dom.interact.triggerEvent('pointerUp', evt);
		},
		keyDown: evt => {
			const keyPressed = dom.interact.keyMap[evt.which || evt.keyCode];

			if (dom.interact.pressedKeys[keyPressed]) return;
			// not yet fired keyup on this key
			else if (!dom.interact.acceptKeyPresses) return (dom.interact.pressedKeys[keyPressed] = 2);
			// keypress while not accepting
			else dom.interact.pressedKeys[keyPressed] = 1; // valid keypress

			++dom.interact.activity;

			if (evt.target.nodeName === 'SELECT') return;

			evt.keyPressed = keyPressed;

			dom.interact.triggerEvent('keyDown', evt);
		},
		keyUp: evt => {
			const keyPressed = dom.interact.keyMap[evt.which || evt.keyCode];

			if (!dom.interact.pressedKeys[keyPressed]) return;
			// keyup already fired on this key
			else if (dom.interact.pressedKeys[keyPressed] === 2) return (dom.interact.pressedKeys[keyPressed] = 0);
			// keypress rejected due to being pressed before accepting
			else dom.interact.pressedKeys[keyPressed] = 0; // valid keypress reset

			dom.validate(evt.target);

			evt.keyPressed = keyPressed;

			dom.interact.triggerEvent('keyUp', evt);
		},
		change: evt => {
			dom.validate(evt.target);

			dom.interact.triggerEvent('change', evt);
		},
	},
	createElem: (node, settingsObj) => {
		const elem = document.createElement(node);

		if (settingsObj) {
			const settingsNames = Object.keys(settingsObj),
				settingsCount = settingsNames.length;
			let settingName;
			let settingValue;

			for (let x = 0; x < settingsCount; ++x) {
				settingName = settingsNames[x];
				settingValue = settingsObj[settingName];

				if (typeof dom[settingName] === 'function') {
					if (Array.isArray(settingValue)) dom[settingName].apply(dom, [elem].concat(settingValue));
					else dom[settingName](elem, settingValue);
				} else if (typeof elem[settingName] === 'function') {
					if (Array.isArray(settingValue)) elem[settingName].apply(elem, settingValue);
					else elem[settingName](settingValue);
				} else elem[settingName] = settingValue;
			}
		}

		return elem;
	},
	style: (elem, styleObj) => {
		for (let x = 0, keys = Object.keys(styleObj), count = keys.length; x < count; ++x) {
			elem.style[keys[x]] = styleObj[keys[x]];
		}
	},
	data: (elem, dataObj) => {
		for (let x = 0, keys = Object.keys(dataObj), count = keys.length; x < count; ++x) {
			elem.dataset[keys[x]] = dataObj[keys[x]];
		}
	},
	attr: (elem, attrObj) => {
		for (let x = 0, keys = Object.keys(attrObj), count = keys.length; x < count; ++x) {
			elem.setAttribute([keys[x]], attrObj[keys[x]]);
		}
	},
	appendChildren: (elem, children, ...args) => {
		if (!elem || !children) return;

		children = Array.isArray(children) ? children : [children, ...args];

		for (let x = 0; x < children.length; ++x) elem.appendChild(children[x]);
	},
	appendTo: (elem, parentElem) => {
		if (elem && parentElem?.appendChild) parentElem.appendChild(elem);
	},
	prependTo: (elem, parentElem) => {
		if (parentElem.firstChild) parentElem.insertBefore(elem, parentElem.firstChild);
		else parentElem.appendChild(elem);
	},
	prependChild: (elem, child) => {
		if (elem.firstChild) elem.insertBefore(child, elem.firstChild);
		else elem.appendChild(child);
	},
	isNodeList: nodes => {
		const nodeCount = nodes?.length;
		const nodesString = Object.prototype.toString.call(nodes);
		const stringRegex = /^\[object (HTMLCollection|NodeList|Object)\]$/;

		return (
			typeof nodes === 'object' &&
			typeof nodeCount === 'number' &&
			stringRegex.test(nodesString) &&
			(nodeCount === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0))
		);
	},
	findAncestor: (elem, class_id) => {
		while (
			(elem = elem.parentElement) &&
			(class_id[0] === '#' ? '#' + elem.id !== class_id : !elem.className.includes(class_id))
		);

		return elem;
	},
	empty: elem_s => {
		if (dom.isNodeList(elem_s)) return [].slice.call(elem_s).forEach(elem => dom.empty(elem));

		if (!elem_s || !elem_s.lastChild) return;

		while (elem_s.lastChild) elem_s.removeChild(elem_s.lastChild);
	},
	getElemIndex: (elem, index) => {
		if (typeof index === 'undefined') index = 0;

		if (elem.previousElementSibling) return dom.getElemIndex(elem.previousElementSibling, ++index);

		return index;
	},
	remove: elem_s => {
		if (dom.isNodeList(elem_s)) elem_s = [].slice.call(elem_s);

		elem_s?.parentElement?.removeChild(elem_s);
	},
	show: (elem, className, done) => {
		dom.animation.add('write', () => {
			elem.classList.remove('hide', 'disappear', 'discard');

			if (className) elem.classList.add(className.split(' '));

			if (done) setTimeout(done, 100);
		});
	},
	hide: (elem, done) => {
		dom.animation.add('write', () => {
			elem.classList.add('hide');

			if (done) setTimeout(done, 100);
		});
	},
	disappear: (elem, done) => {
		dom.animation.add('write', () => {
			elem.classList.add('disappear');

			if (done) done();
		});
	},
	discard: (elem, className, done) => {
		dom.animation.add('write', () => {
			elem.classList.add('discard');

			if (className) elem.classList.add(className.split(' '));

			setTimeout(() => {
				dom.disappear(elem, done);
			}, 100);
		});
	},
	setTransform: (elem, value) => {
		dom.animation.add('write', () => {
			elem.style.transform =
				elem.style.webkitTransform =
				elem.style.MozTransform =
				elem.style.msTransform =
				elem.style.OTransform =
					value;
		});
	},
	isDescendantOf: (elem, parent) => {
		const isTheParent = elem.parentElement === parent;

		return !isTheParent && elem.parentElement.parentElement
			? dom.isDescendantOf(elem.parentElement.parentElement, parent)
			: isTheParent;
	},
	getPixelDensity: () => {
		const reqTime = performance.now();

		if (dom.pixelDensity && dom.lastPixelDensityRefresh && reqTime - dom.lastPixelDensityRefresh < 5e3)
			return dom.pixelDensity;

		dom.lastPixelDensityRefresh = reqTime;

		return (dom.pixelDensity = window.devicePixelRatio || 1);
	},
	get scrollbarSize() {
		const scrollbarDiv = dom.createElem('div', { id: 'scrollbarDiv', appendTo: document.body });

		dom.scrollbarSize = scrollbarDiv.offsetWidth - scrollbarDiv.clientWidth;

		dom.remove(scrollbarDiv);

		return dom.scrollbarSize;
	},
	validate: (elem, force) => {
		if (!elem) return;

		let x, count;

		if (elem instanceof Array) {
			for (x = 0, count = elem.length; x < count; ++x) dom.validate(elem[x], force);

			return;
		}

		if (force || elem.validation) elem.classList.remove('validated', 'invalid');

		let valid,
			validationWarning = '';

		if (force) valid = 'validated';
		else if (elem.validation) {
			if (elem.validation instanceof Array) {
				for (x = 0, count = elem.validation.length; x < count; ++x) {
					if (valid !== 'invalid') {
						valid = dom.checkValid(elem.value, elem.validation[x]);

						if (elem.validationWarning[x] && valid === 'invalid')
							validationWarning += (validationWarning.length ? '\n' : '') + elem.validationWarning[x];
					}
				}
			} else {
				valid = dom.checkValid(elem.value, elem.validation);

				if (elem.validationWarning && valid === 'invalid') validationWarning = elem.validationWarning;
			}
		}

		elem.classList.add(valid);

		if (valid === 'validated') dom.showValidationWarnings(elem.parentElement);

		return validationWarning;
	},
	checkValid: (string, regex) => {
		return new RegExp(regex).test(string) ? 'validated' : 'invalid';
	},
	showValidationWarnings: parentElement => {
		if (!parentElement) return;

		const invalidElements = parentElement.getElementsByClassName('invalid');

		dom.remove(parentElement.getElementsByClassName('validationWarning'));

		if (!invalidElements || !invalidElements.length) return;

		let showingWarnings = false;

		for (let x = 0; x < invalidElements.length; ++x) {
			const validationWarning = dom.validate(invalidElements[x]);

			if (validationWarning) {
				showingWarnings = true;

				invalidElements[x].parentElement.insertBefore(
					dom.createElem('p', { className: 'validationWarning', textContent: validationWarning }),
					invalidElements[x],
				);
			}
		}

		if (!showingWarnings)
			dom.createElem('p', {
				className: 'validationWarning',
				textContent: 'There are fields which require your attention!',
				prependTo: parentElement,
			});

		return showingWarnings;
	},
	getScreenOrientation: () => {
		let orientation = 'primary';

		if (window.screen && window.screen.orientation && window.screen.orientation.type)
			orientation = window.screen.orientation.type;
		else if (typeof window.orientation !== 'undefined')
			orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';

		return orientation;
	},
	downloadURL: (url, fileName) => {
		const a = dom.createElem('a', {
			href: url,
			download: fileName,
			appendTo: document.body,
			style: { display: 'none' },
		});

		a.click();

		dom.remove(a);
	},
	fadeOut: (startDate, rate = 1e10, currentDate) => {
		startDate = new Date(startDate).getTime();
		currentDate = new Date(currentDate).getTime();

		document.body.style.opacity = Math.max(0, 1 - (currentDate - startDate) / rate);
	},
	isMobile: false,
	mobile: {
		detect: evt => {
			if (!evt) {
				if (!dom.mobile.detectionEnabled) {
					dom.mobile.detectionEnabled = true;

					document.addEventListener('touchstart', dom.mobile.detect);
					document.addEventListener('mousedown', dom.mobile.detect);
					document.addEventListener('touchend', dom.mobile.detect);
					document.addEventListener('touchcancel', dom.mobile.detect);
					document.addEventListener('mouseup', dom.mobile.detect);
				}

				return;
			}

			const isTouch = !evt.type.startsWith('mouse');

			if (!isTouch && dom.mobile.lastTouchTime && performance.now() - dom.mobile.lastTouchTime < 350)
				return dom.log(4)('[dom] Block touch to mouse emulation');
			else if (isTouch) dom.mobile.lastTouchTime = performance.now();

			dom.mobile[`${isTouch ? 'en' : 'dis'}able`]();
		},
		enable: () => {
			if (dom.isMobile) return;

			document.body.classList.add('mobile');

			dom.isMobile = true;
		},
		disable: () => {
			if (dom.isMobile === false) return;

			document.body.classList.remove('mobile');

			dom.isMobile = false;
		},
	},
	run: function run(arr, destructive) {
		if (!destructive) arr = arr.slice(0);

		let task;

		while ((task = arr.shift())) task();
	},
	animation: {
		scheduled: false,
		read_tasks: [],
		write_tasks: [],
		add: (read_write, task, context, ...args) => {
			if (context) {
				if (args.length > 3) {
					//Log()('animation', 'applying args', args);

					task = task.bind.apply(task, [context, ...args]);
				} else task = task.bind(context);
			}

			dom.animation[read_write + '_tasks'].push(task);

			//Log()('animation', 'add animation', read_write, dom.animation.read_tasks.length, dom.animation.write_tasks.length);

			dom.animation.schedule();

			return task;
		},
		replace: (read_write, task, context /*, arguments*/) => {
			if (dom.animation[read_write + '_tasks'].includes(task)) {
				if (context) task = task.bind(context);

				//Log()('animation', 'replace animation');

				dom.animation[read_write + '_tasks'][dom.animation[read_write + '_tasks'].indexOf(task)] = task;
			} else dom.animation.add(read_write, task, context);
		},
		runner: () => {
			try {
				if (dom.animation.read_tasks.length) {
					//Log()('animation', 'running reads', dom.animation.read_tasks.length);
					dom.run(dom.animation.read_tasks, 1);
				}
				if (dom.animation.write_tasks.length) {
					//Log()('animation', 'running writes', dom.animation.write_tasks.length);
					dom.run(dom.animation.write_tasks, 1);
				}
			} catch (err) {
				dom.log.error('[dom] Animation runner encountered an error!', err);
			}

			dom.animation.scheduled = false;

			if (dom.animation.read_tasks.length || dom.animation.write_tasks.length) dom.animation.schedule();
		},
		schedule: () => {
			if (dom.animation.scheduled) return;
			dom.animation.scheduled = true;

			(
				window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				(cb => setTimeout(cb, 16))
			)(dom.animation.runner);
		},
	},
	maintenance: {
		// todo add a way to remove maintenance functions
		functions: [],
		init: additionalMaintenance => {
			if (dom.maintenance.initialized) return dom.maintenance.add(additionalMaintenance);

			dom.maintenance.initialized = true;

			window.addEventListener('resize', () => {
				if (dom.maintenance.resizeTO) {
					clearTimeout(dom.maintenance.resizeTO);

					delete dom.maintenance.resizeTO;
				}

				dom.maintenance.resizeTO = setTimeout(dom.maintenance.run, 300);
			});

			return dom.maintenance.add(additionalMaintenance);
		},
		add: additionalMaintenance => {
			if (additionalMaintenance) dom.maintenance.functions = dom.maintenance.functions.concat(additionalMaintenance);

			dom.maintenance.run();
		},
		run: () => {
			dom.animation.add('read', () => {
				dom.availableHeight = document.body.clientHeight;
				dom.availableWidth = document.body.clientWidth;

				dom.animation.add('write', dom.run.bind(null, dom.maintenance.functions));
			});
		},
	},
};

export default dom;
