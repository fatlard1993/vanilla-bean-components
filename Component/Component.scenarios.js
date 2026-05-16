import Component from '../../Component/Component.js';

export const __lld_api = `
  destructiveRender() -> boolean | renders a component twice; returns true if child count matches (1) — second render cleared the first
  optionReactionFires() -> number | assigns to option after render; returns how many times _setOption was called (1 = reactive)
  buildBeforeOptions() -> boolean | verifies build() DOM structure exists when _setOption runs (true = ordering is correct)
  priorityRunsFirst() -> boolean | textContent (priority option) runs before style (non-priority); returns true if correct order
  replaceCleanupRunsOnce() -> number | replaceCleanup called 3x with same key; returns count of fns that ran at processCleanup time (1 = no accumulation)
`;

export const destructiveRender = () => {
	class TestComp extends Component {
		build() {
			this.elem.append(document.createElement('span'));
		}
	}
	const comp = new TestComp({ autoRender: false });
	comp.render();
	const afterFirst = comp.elem?.children?.length ?? 0;
	comp.render();
	const afterSecond = comp.elem?.children?.length ?? 0;
	return afterFirst === 1 && afterSecond === 1;
};

export const optionReactionFires = () => {
	let reactions = 0;
	class TestComp extends Component {
		_setOption(key, value) {
			if (key === 'textContent' && this.rendered) reactions++;
			super._setOption(key, value);
		}
	}
	const comp = new TestComp({ autoRender: false });
	comp.render();
	const baseline = reactions;
	comp.options.textContent = 'hello';
	return reactions - baseline;
};

export const buildBeforeOptions = () => {
	let buildRanBeforeOption = false;
	let buildRan = false;
	class TestComp extends Component {
		build() {
			buildRan = true;
			this.elem.append(document.createElement('span'));
		}
		_setOption(key, value) {
			if (key === 'textContent') buildRanBeforeOption = buildRan;
			super._setOption(key, value);
		}
	}
	const comp = new TestComp({ textContent: 'hello', autoRender: false });
	comp.render();
	return buildRanBeforeOption;
};

export const priorityRunsFirst = () => {
	const order = [];
	class TestComp extends Component {
		build() {}
		_setOption(key, value) {
			if (key === 'textContent' || key === 'style') order.push(key);
			super._setOption(key, value);
		}
	}
	// textContent is a priority option; style is not
	const comp = new TestComp({ textContent: 'hello', style: { color: 'red' }, autoRender: false });
	comp.render();
	return order[0] === 'textContent';
};

export const replaceCleanupRunsOnce = () => {
	const comp = new Component({ autoRender: false });
	let count = 0;
	comp.replaceCleanup('test', () => {
		count++;
	});
	comp.replaceCleanup('test', () => {
		count++;
	}); // runs previous = 1
	comp.replaceCleanup('test', () => {
		count++;
	}); // runs previous = 2, stores latest
	const countBeforeCleanup = count;
	comp.processCleanup(); // runs only the latest = 3
	return count - countBeforeCleanup; // 1 — only latest ran at cleanup time
};
