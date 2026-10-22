import { styled } from '../../styled';
import theme from '../../theme';
import { Button } from '../Button';

/**
 * A button filled with a color, the way ColorPicker shows its swatches: the fill-drip glyph gives it its size, and its
 * text takes whichever of white or black reads on the fill. The color 'random' has no single color to show, so it
 * cycles through the hues instead.
 * @param {object} [options] - ColorSwatch configuration
 * @param {string} [options.color] - A CSS color, or 'random'
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {ColorSwatch} ColorSwatch component instance
 * @example new ColorSwatch({ color: '#3d7aed', onPointerPress: () => pick('#3d7aed') })
 */
class ColorSwatch extends styled(
	Button,
	({ colors, space }) => `
		margin-top: ${space.xs};
		margin-right: ${space.xs};

		&.rainbow {
			animation: vbc-color-swatch-rainbow 2s linear infinite;
			color: ${colors.black};

			@keyframes vbc-color-swatch-rainbow {
				100%, 0% { background-color: ${colors.light(colors.red)}; }
				12% { background-color: ${colors.light(colors.orange)}; }
				25% { background-color: ${colors.light(colors.yellow)}; }
				37% { background-color: ${colors.light(colors.green)}; }
				50% { background-color: ${colors.light(colors.teal)}; }
				62% { background-color: ${colors.light(colors.blue)}; }
				75% { background-color: ${colors.light(colors.purple)}; }
				87% { background-color: ${colors.light(colors.pink)}; }
			}
		}
	`,
	{ icon: 'fill-drip' },
) {
	static schema = {
		color: {
			set(value) {
				const random = value === 'random';

				this[random ? 'addClass' : 'removeClass']('rainbow');

				this.setStyle({
					backgroundColor: random || !value ? '' : value,
					color:
						random || !value
							? ''
							: theme.colors.mostReadable(value, [theme.colors.white, theme.colors.black]).toString(),
				});
			},
		},
	};
}

export default ColorSwatch;
