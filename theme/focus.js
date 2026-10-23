/**
 * The one focus ring: a solid line in the selected role, drawn a little outside the control so it reads against the
 * page's dark ground whatever the control's own fill. Hang it on :focus-visible, so a pointer press draws none. Inside
 * something that clips (a scrolling tab row, a menu's rows), a negative offset draws it just within the edge.
 * @param {object} theme - The theme
 * @param {object} theme.colors - Its colors
 * @param {string} [offset] - How far outside the edge it sits; negative for inside
 * @returns {string} CSS declarations
 * @example &:focus-visible { ${focusRing(theme)} }
 */
export default ({ colors }, offset = '2px') => `
	outline: 2px solid ${colors.light(colors.selected)};
	outline-offset: ${offset};
`;
