/**
 * Strip all excess newline and indentation whitespace from the source string
 * @param {String} string - The source string
 * @return {String} The re-formatted string
 */
export const removeExcessIndentation = string => {
	if (!string.includes('\t')) return string;
	if (!string.includes('\n')) return string.replace(/^\t+/, '');

	const lines = string.split('\n');

	const minIndentation = lines
		.map(line => line.match(/^\t+/) || [])
		.reduce((a, b) => {
			if (!a?.length) return b;
			if (!b?.length) return a;

			return a.length <= b.length ? a : b;
		});

	return lines.join('\n').replaceAll(new RegExp(`^${minIndentation}`, 'gm'), '');
};
