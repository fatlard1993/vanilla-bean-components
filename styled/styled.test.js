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

			expect(mockShimCSS).not.toHaveBeenCalled();
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

	describe('nested styled components', () => {
		test('creates styled component from another styled component', () => {
			mockNanoid.mockReturnValueOnce('base-id').mockReturnValueOnce('nested-id');

			const BaseStyledComponent = styled(Component, () => 'color: red; margin: 10px;');
			const NestedStyledComponent = styled(BaseStyledComponent, () => 'background: blue; padding: 5px;');

			expect(mockShimCSS).toHaveBeenCalledTimes(2);

			const instance = new NestedStyledComponent({ textContent: 'nested test' });

			expect(instance.elem.textContent).toBe('nested test');
			expect(instance.elem.classList.contains('base-id')).toBe(true);
			expect(instance.elem.classList.contains('nested-id')).toBe(true);
		});

		test('nested styled component inherits base options', () => {
			mockNanoid.mockReturnValueOnce('base-id').mockReturnValueOnce('nested-id');

			const BaseStyledComponent = styled(Component, () => 'color: red;', {
				tag: 'section',
				role: 'banner',
				baseProp: 'base-value',
			});
			const NestedStyledComponent = styled(BaseStyledComponent, () => 'background: blue;', {
				nestedProp: 'nested-value',
			});

			const instance = new NestedStyledComponent({ textContent: 'test' });

			expect(instance.elem.tagName.toLowerCase()).toBe('section');
			expect(instance.elem.getAttribute('role')).toBe('banner');
			expect(instance.options.baseProp).toBe('base-value');
			expect(instance.options.nestedProp).toBe('nested-value');
		});

		test('nested styled component merges addClass correctly', () => {
			mockNanoid.mockReturnValueOnce('base-id').mockReturnValueOnce('nested-id');

			const BaseStyledComponent = styled(Component, () => 'color: red;', {
				addClass: 'base-class',
			});
			const NestedStyledComponent = styled(BaseStyledComponent, () => 'background: blue;', {
				addClass: 'nested-class',
			});

			const instance = new NestedStyledComponent({ addClass: 'instance-class' });

			expect(instance.elem.classList.contains('base-id')).toBe(true);
			expect(instance.elem.classList.contains('nested-id')).toBe(true);
			expect(instance.elem.classList.contains('base-class')).toBe(true);
			expect(instance.elem.classList.contains('nested-class')).toBe(true);
			expect(instance.elem.classList.contains('instance-class')).toBe(true);
		});

		test('styles are processed independently for each level', () => {
			mockNanoid.mockReturnValueOnce('base-id').mockReturnValueOnce('nested-id');

			const baseStyles = ({ colors }) => `color: ${colors.red};`;
			const nestedStyles = ({ colors }) => `background: ${colors.blue};`;

			const BaseStyledComponent = styled(Component, baseStyles);
			styled(BaseStyledComponent, nestedStyles);

			expect(mockShimCSS).toHaveBeenCalledTimes(2);

			const baseShimCall = mockShimCSS.mock.calls[0][0];
			const nestedShimCall = mockShimCSS.mock.calls[1][0];

			expect(baseShimCall.scope).toBe('.base-id');
			expect(nestedShimCall.scope).toBe('.nested-id');

			const baseResult = baseShimCall.styles(theme);
			const nestedResult = nestedShimCall.styles(theme);

			expect(baseResult).toContain(theme.colors.red.toString());
			expect(nestedResult).toContain(theme.colors.blue.toString());
		});

		test('handles multiple levels of nesting (3 levels deep)', () => {
			mockNanoid.mockReturnValueOnce('level1-id').mockReturnValueOnce('level2-id').mockReturnValueOnce('level3-id');

			const Level1Component = styled(Component, () => 'color: red;', {
				tag: 'article',
				level1Prop: 'value1',
			});

			const Level2Component = styled(Level1Component, () => 'background: blue;', {
				level2Prop: 'value2',
			});

			const Level3Component = styled(Level2Component, () => 'border: 1px solid black;', {
				level3Prop: 'value3',
			});

			expect(mockShimCSS).toHaveBeenCalledTimes(3);

			const instance = new Level3Component({ textContent: 'deep nested' });

			expect(instance.elem.textContent).toBe('deep nested');
			expect(instance.elem.tagName.toLowerCase()).toBe('article');

			expect(instance.elem.classList.contains('level1-id')).toBe(true);
			expect(instance.elem.classList.contains('level2-id')).toBe(true);
			expect(instance.elem.classList.contains('level3-id')).toBe(true);

			expect(instance.options.level1Prop).toBe('value1');
			expect(instance.options.level2Prop).toBe('value2');
			expect(instance.options.level3Prop).toBe('value3');
		});

		test('nested styled components work with template literal syntax', () => {
			mockNanoid.mockReturnValueOnce('base-id').mockReturnValueOnce('nested-id');

			const mockBaseLiteral = ['color: red; font-size: 16px;'];
			mockBaseLiteral.raw = ['color: red; font-size: 16px;'];

			const mockNestedLiteral = ['background: blue; padding: ', ';'];
			mockNestedLiteral.raw = ['background: blue; padding: ', ';'];

			const BaseStyledComponent = styled(Component, mockBaseLiteral);
			const NestedStyledComponent = styled(BaseStyledComponent, mockNestedLiteral, '10px');

			expect(mockShimCSS).toHaveBeenCalledTimes(2);

			const instance = new NestedStyledComponent();

			expect(instance.elem.classList.contains('base-id')).toBe(true);
			expect(instance.elem.classList.contains('nested-id')).toBe(true);

			const baseShimCall = mockShimCSS.mock.calls[0][0];
			const nestedShimCall = mockShimCSS.mock.calls[1][0];

			expect(baseShimCall.styles()).toContain('color: red');
			expect(nestedShimCall.styles()).toContain('padding: 10px');
		});
	});

	describe('CSS specificity and class order', () => {
		test('nested styled components maintain correct class order for specificity', () => {
			mockNanoid.mockReturnValueOnce('base-scope').mockReturnValueOnce('nested-scope');

			const BaseComponent = styled(Component, () => 'color: red;', { addClass: 'base-class' });
			const NestedComponent = styled(BaseComponent, () => 'color: blue;', { addClass: 'nested-class' });

			const instance = new NestedComponent({ addClass: 'instance-class' });

			const classList = Array.from(instance.elem.classList);

			expect(classList).toContain('base-scope');
			expect(classList).toContain('nested-scope');
			expect(classList).toContain('base-class');
			expect(classList).toContain('nested-class');
			expect(classList).toContain('instance-class');

			const baseScopeIndex = classList.indexOf('base-scope');
			const nestedScopeIndex = classList.indexOf('nested-scope');

			expect(baseScopeIndex).toBeLessThan(nestedScopeIndex);
		});

		test('each nested level gets unique CSS scope and independent style processing', () => {
			mockNanoid.mockReturnValueOnce('scope-1').mockReturnValueOnce('scope-2').mockReturnValueOnce('scope-3');

			const Component1 = styled(Component, ({ colors }) => `color: ${colors.red}; font-size: 12px;`);
			const Component2 = styled(Component1, ({ colors }) => `background: ${colors.blue}; margin: 5px;`);
			styled(Component2, ({ colors }) => `border: 1px solid ${colors.green}; padding: 10px;`);

			expect(mockShimCSS).toHaveBeenCalledTimes(3);

			const scope1Call = mockShimCSS.mock.calls[0][0];
			const scope2Call = mockShimCSS.mock.calls[1][0];
			const scope3Call = mockShimCSS.mock.calls[2][0];

			expect(scope1Call.scope).toBe('.scope-1');
			expect(scope2Call.scope).toBe('.scope-2');
			expect(scope3Call.scope).toBe('.scope-3');

			const styles1 = scope1Call.styles(theme);
			const styles2 = scope2Call.styles(theme);
			const styles3 = scope3Call.styles(theme);

			expect(styles1).toContain(`color: ${theme.colors.red}`);
			expect(styles1).toContain('font-size: 12px');

			expect(styles2).toContain(`background: ${theme.colors.blue}`);
			expect(styles2).toContain('margin: 5px');

			expect(styles3).toContain(`border: 1px solid ${theme.colors.green}`);
			expect(styles3).toContain('padding: 10px');

			expect(styles1).not.toContain('background');
			expect(styles1).not.toContain('border');
			expect(styles2).not.toContain('border');
			expect(styles2).not.toContain('color');
		});

		test('configured options merge correctly across nested levels', () => {
			const Level1 = styled(Component, () => 'color: red;', {
				tag: 'section',
				role: 'banner',
				prop1: 'value1',
				addClass: 'class1',
			});

			const Level2 = styled(Level1, () => 'background: blue;', {
				role: 'main',
				prop2: 'value2',
				addClass: 'class2',
			});

			const Level3 = styled(Level2, () => 'border: solid;', {
				prop3: 'value3',
				addClass: 'class3',
			});

			const instance = new Level3({
				prop1: 'override1',
				instanceProp: 'instanceValue',
				addClass: 'instanceClass',
			});

			expect(instance.elem.tagName.toLowerCase()).toBe('section');
			expect(instance.elem.getAttribute('role')).toBe('main');

			expect(instance.options.prop1).toBe('override1');
			expect(instance.options.prop2).toBe('value2');
			expect(instance.options.prop3).toBe('value3');
			expect(instance.options.instanceProp).toBe('instanceValue');

			expect(instance.elem.classList.contains('class1')).toBe(true);
			expect(instance.elem.classList.contains('class2')).toBe(true);
			expect(instance.elem.classList.contains('class3')).toBe(true);
			expect(instance.elem.classList.contains('instanceClass')).toBe(true);
		});
	});

	describe('constructor invocation errors', () => {
		test('styled component must be called with new keyword', () => {
			const StyledComponent = styled(Component, () => 'color: red;');

			expect(() => {
				StyledComponent();
			}).toThrow(/Cannot call a class constructor|Class constructor.*cannot be invoked without/);

			expect(() => {
				new StyledComponent();
			}).not.toThrow();
		});

		test('nested styled component must be called with new keyword', () => {
			const BaseStyledComponent = styled(Component, () => 'color: red;');
			const NestedStyledComponent = styled(BaseStyledComponent, () => 'background: blue;');

			expect(() => {
				NestedStyledComponent();
			}).toThrow(/Cannot call a class constructor|Class constructor.*cannot be invoked without/);

			expect(() => {
				new NestedStyledComponent();
			}).not.toThrow();
		});

		test('configured function works with already configured components', () => {
			const BaseStyledComponent = styled(Component, () => 'color: red;');

			expect(() => {
				const DoubleConfigured = configured(BaseStyledComponent, { addClass: 'double' });
				const instance = new DoubleConfigured();

				expect(instance).toBeDefined();
			}).not.toThrow();
		});

		test('styled template literal with styled component returns valid class', () => {
			const BaseStyledComponent = styled(Component, () => 'color: red;');

			const result = styled(BaseStyledComponent)`
				background: blue;
				padding: 10px;
			`;

			expect(typeof result).toBe('function');
			expect(result.prototype).toBeDefined();
			expect(() => new result()).not.toThrow();
		});

		test('class extends styled template literal should work correctly', () => {
			const BaseStyledComponent = styled(Component, () => 'color: red;');

			expect(() => {
				// eslint-disable-next-line no-unused-vars
				class ExtendedComponent extends (styled(BaseStyledComponent)`
					background: blue;
					padding: 10px;
				`) {}
			}).not.toThrow();
		});

		test('class extends styled template literal can be instantiated', () => {
			const BaseStyledComponent = styled(Component, () => 'color: red;');

			expect(() => {
				class ExtendedComponent extends (styled(BaseStyledComponent)`
					background: blue;
				`) {}

				const instance = new ExtendedComponent();

				expect(instance).toBeDefined();
			}).not.toThrow();
		});
	});
});
