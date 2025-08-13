/// <reference lib="dom" />

import { Component } from '../Component';
import theme from '../theme';
import { styled, configured } from './styled';

const mockShimCSS = mock(() => {});
mock.module('./shimCSS', () => ({ shimCSS: mockShimCSS }));

const mockNanoid = mock(() => 'test-id-1234567890');
mock.module('../utils', () => ({ classSafeNanoid: mockNanoid }));

describe('styled system', () => {
	beforeEach(() => {
		mockShimCSS.mockClear();
		mockNanoid.mockClear();
	});

	describe('configured()', () => {
		test('creates component with embedded options', () => {
			const options = { tag: 'article', textContent: 'default', customProp: 'test' };
			const ConfiguredComponent = configured(Component, options);
			const instance = new ConfiguredComponent({ textContent: 'override' });

			expect(instance.elem.tagName.toLowerCase()).toBe('article');
			expect(instance.elem.textContent).toBe('override');
			expect(instance.options.customProp).toBe('test');
		});

		test('merges addClass from both options and instance', () => {
			const ConfiguredComponent = configured(Component, { addClass: 'base-class' });
			const instance = new ConfiguredComponent({ addClass: 'instance-class' });

			expect(instance.elem.classList.contains('base-class')).toBe(true);
			expect(instance.elem.classList.contains('instance-class')).toBe(true);
		});

		test('overlays instance options over base options', () => {
			const baseOptions = {
				tag: 'section',
				role: 'banner',
				textContent: 'base',
				customValue: 'base',
			};

			const ConfiguredComponent = configured(Component, baseOptions);
			const instance = new ConfiguredComponent({
				textContent: 'override',
				customValue: 'override',
				newProp: 'new',
			});

			expect(instance.elem.tagName.toLowerCase()).toBe('section');
			expect(instance.elem.getAttribute('role')).toBe('banner');
			expect(instance.elem.textContent).toBe('override');
			expect(instance.options.customValue).toBe('override');
			expect(instance.options.newProp).toBe('new');
		});

		test('handles children correctly', () => {
			const ConfiguredComponent = configured(Component, { tag: 'div' });
			const child1 = new Component({ textContent: 'child1' });
			const child2 = new Component({ textContent: 'child2' });

			const instance = new ConfiguredComponent({}, child1, child2);

			expect(instance.elem.children).toHaveLength(2);
			expect(instance.elem.children[0].textContent).toBe('child1');
			expect(instance.elem.children[1].textContent).toBe('child2');
		});
	});

	describe('styled() function syntax', () => {
		test('creates component with scoped styles', () => {
			const testCSS = 'color: red; display: flex;';
			const StyledComponent = styled(Component, () => testCSS);

			expect(mockShimCSS).toHaveBeenCalledTimes(1);
			const shimCall = mockShimCSS.mock.calls[0][0];
			expect(shimCall).toHaveProperty('styles');
			expect(shimCall).toHaveProperty('scope');
			expect(shimCall.scope).toBe('.test-id-1234567890');

			const instance = new StyledComponent({ textContent: 'test' });
			expect(instance.elem.textContent).toBe('test');

			expect(instance.elem.classList.contains('test-id-1234567890')).toBe(true);
		});

		test('applies theme to styles function', () => {
			const stylesFunction = mock(({ colors }) => `color: ${colors.red};`);
			styled(Component, stylesFunction);

			expect(mockShimCSS).toHaveBeenCalledTimes(1);
			const shimCall = mockShimCSS.mock.calls[0][0];

			const result = shimCall.styles(theme);
			expect(stylesFunction).toHaveBeenCalledWith(theme);
			expect(result).toContain(theme.colors.red.toString());
		});

		test('merges configuration options with styles', () => {
			const options = { tag: 'section', role: 'banner', testProp: 'value' };
			const StyledComponent = styled(Component, () => 'color: blue;', options);
			const instance = new StyledComponent({ textContent: 'test' });

			expect(instance.elem.tagName.toLowerCase()).toBe('section');
			expect(instance.elem.getAttribute('role')).toBe('banner');
			expect(instance.options.testProp).toBe('value');
		});

		test('creates unique scoped class identifiers for each component', () => {
			mockNanoid.mockReturnValueOnce('unique-id-1').mockReturnValueOnce('unique-id-2');

			styled(Component, () => 'color: red;');
			styled(Component, () => 'color: blue;');

			expect(mockShimCSS).toHaveBeenCalledTimes(2);

			const scope1 = mockShimCSS.mock.calls[0][0].scope;
			const scope2 = mockShimCSS.mock.calls[1][0].scope;

			expect(scope1).toBe('.unique-id-1');
			expect(scope2).toBe('.unique-id-2');
		});

		test('handles empty styles function', () => {
			styled(Component);

			expect(mockShimCSS).toHaveBeenCalledTimes(1);
			const shimCall = mockShimCSS.mock.calls[0][0];
			expect(shimCall.styles()).toBe('');
		});

		test('combines addClass from options with generated scope class', () => {
			const StyledComponent = styled(Component, () => 'color: red;', { addClass: 'custom-class' });
			const instance = new StyledComponent();

			expect(instance.elem.classList.contains('test-id-1234567890')).toBe(true);
			expect(instance.elem.classList.contains('custom-class')).toBe(true);
		});
	});

	describe('styled() template literal syntax', () => {
		test('detects template literal syntax', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = ['color: red; background: blue;'];
			mockTemplateLiteral.raw = ['color: red; background: blue;'];

			styled(Component, mockTemplateLiteral);

			expect(mockShimCSS).toHaveBeenCalledTimes(1);
			const shimCall = mockShimCSS.mock.calls[0][0];
			expect(shimCall.styles).toBeInstanceOf(Function);

			const result = shimCall.styles();
			expect(result).toContain('color: red');
			expect(result).toContain('background: blue');
		});

		test('interpolates functions in template literals', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = ['color: ', '; background: ', ';'];
			mockTemplateLiteral.raw = ['color: ', '; background: ', ';'];

			const colorFunction = ({ colors }) => colors.red;
			const bgFunction = ({ colors }) => colors.blue;

			styled(Component, mockTemplateLiteral, colorFunction, bgFunction);

			expect(mockShimCSS).toHaveBeenCalledTimes(1);
			const shimCall = mockShimCSS.mock.calls[0][0];

			const result = shimCall.styles();
			expect(result).toContain(`color: ${theme.colors.red}`);
			expect(result).toContain(`background: ${theme.colors.blue}`);
		});

		test('interpolates static values in template literals', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = ['margin: ', '; color: red;'];
			mockTemplateLiteral.raw = ['margin: ', '; color: red;'];

			const staticValue = '15px';
			styled(Component, mockTemplateLiteral, staticValue);

			const shimCall = mockShimCSS.mock.calls[0][0];
			const result = shimCall.styles();

			expect(result).toContain(`margin: ${staticValue}`);
			expect(result).toContain('color: red');
		});

		test('template literal creates component with empty options', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = ['color: red;'];
			mockTemplateLiteral.raw = ['color: red;'];

			const StyledComponent = styled(Component, mockTemplateLiteral);
			const instance = new StyledComponent();

			expect(instance.elem.tagName.toLowerCase()).toBe('div');
		});

		test('handles empty template literal', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = [''];
			mockTemplateLiteral.raw = [''];

			styled(Component, mockTemplateLiteral);

			const shimCall = mockShimCSS.mock.calls[0][0];
			const result = shimCall.styles();

			expect(result).toBe('');
		});

		test('processes multi-line template literal', () => {
			mockShimCSS.mockClear();

			const mockTemplateLiteral = [
				`
				display: flex;
				flex-direction: column;

				.child {
					margin: 5px;
				}
			`,
			];
			mockTemplateLiteral.raw = [
				`
				display: flex;
				flex-direction: column;

				.child {
					margin: 5px;
				}
			`,
			];

			styled(Component, mockTemplateLiteral);

			const shimCall = mockShimCSS.mock.calls[0][0];
			const result = shimCall.styles();

			expect(result).toContain('display: flex');
			expect(result).toContain('flex-direction: column');
			expect(result).toContain('.child');
			expect(result).toContain('margin: 5px');
		});
	});

	describe('component inheritance and behavior', () => {
		test('styled component inherits all base component functionality', () => {
			const StyledComponent = styled(Component, () => 'color: red;');
			const instance = new StyledComponent({
				textContent: 'test content',
				onClick: () => 'clicked',
				addClass: 'additional-class',
			});

			expect(instance.elem.textContent).toBe('test content');
			expect(instance.elem.classList.contains('additional-class')).toBe(true);
			expect(typeof instance.on).toBe('function');
			expect(typeof instance.render).toBe('function');
		});
	});
});
