/**
 * Strip all excess newline and indentation whitespace from the source string
 * @param {String} string - The source string
 * @return {String} The re-formatted string
 */
export const removeExcessIndentation = string => {
	if (!string.includes('\t')) return string;
	if (!string.includes('\n')) return string.replace(/^\t+/, '');

	const lines = string.split('\n').filter(line => !/^\t*$/.test(line));

	const minIndentation = lines.map(line => line.match(/^\t+/) || []).reduce((a, b) => (a.length <= b.length ? a : b));

	return lines.join('\n').replaceAll(new RegExp(minIndentation, 'g'), '');
};
