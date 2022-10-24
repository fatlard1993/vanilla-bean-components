import state from '../components/state';

export const debounceCb = (cb, delay = 400) => {
	if (state[cb]) clearTimeout(state[cb]);

	state[cb] = setTimeout(cb, delay);
};

export const run = (arr, destructive) => {
	if (!destructive) arr = arr.slice(0);

	let task;

	while ((task = arr.shift())) task();
};
