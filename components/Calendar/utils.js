export const getDaysInMonth = (year, month) => {
	const isLeap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

	return {
		numberOfDays: [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month],
		firstDay: new Date(year, month).getDay(),
	};
};

export const to12hour = hour => {
	hour = hour < 12 ? hour : hour % 12;

	if (hour === 0) hour = 12;

	return hour;
};

// eslint-disable-next-line spellcheck/spell-checker
const nth = ['th', 'st', 'nd', 'rd'];
export const toNth = number => {
	if (number > 3 && number < 21) return nth[0];

	return nth[number.toString().slice(-1)] || nth[0];
};

export const formatTime = (date, options = {}) => {
	let hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	let am_pm = '';

	if (!options.display24h) {
		am_pm = hours < 12 ? 'AM' : 'PM';
		hours = to12hour(hours);
	}

	return (
		hours +
		(minutes < 10 ? ':0' : ':') +
		minutes +
		(seconds && options.displaySeconds ? (seconds < 10 ? ':0' : ':') + seconds : '') +
		am_pm
	);
};

export const formatDuration = (duration, append = '', prepend = '') => {
	if (!duration) return '';

	duration = Math.floor(duration / 1000 / 60);

	const hours = Math.floor(duration / 60);
	const minutes = duration % 60;

	return append + (hours ? hours + 'h ' : '') + (minutes ? minutes + 'mins' : '') + prepend;
};
