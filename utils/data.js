import state from '../components/state';

export const debounceCb = (cb, delay = 400, ...args) => {
	if (state?.debounceCb?.[cb]) clearTimeout(state.debounceCb[cb]);

	state.debounceCb = state.debounceCb || {};

	state.debounceCb[cb] = setTimeout(() => cb(...args), delay);
};

export const run = (arr, destructive) => {
	if (!destructive) arr = arr.slice(0);

	let task;

	while ((task = arr.shift())) task();
};
