import { buildClassList, classSafeNanoid } from './class';

describe('class utilities', () => {
	describe('classSafeNanoid', () => {
		test('generates default length ID', () => {
			const id = classSafeNanoid();

			expect(typeof id).toBe('string');
			expect(id.length).toBe(10);
			expect(/^[A-Za-z_-]+$/.test(id)).toBe(true);
		});

		test('generates custom length ID', () => {
			const shortId = classSafeNanoid(5);
			const longId = classSafeNanoid(20);

			expect(shortId.length).toBe(5);
			expect(longId.length).toBe(20);
			expect(/^[A-Za-z_-]+$/.test(shortId)).toBe(true);
			expect(/^[A-Za-z_-]+$/.test(longId)).toBe(true);
		});

		test('generates unique ids', () => {
			const ids = new Set();
			const iterations = 100;

			for (let i = 0; i < iterations; i++) {
				ids.add(classSafeNanoid());
			}

			expect(ids.size).toBe(iterations);
		});
	});

	describe('buildClassList', () => {
		test('handles simple string arguments', () => {
			const result = buildClassList('one', 'two', 'three');
			expect(result).toEqual(['one', 'two', 'three']);
		});

		test('removes duplicates', () => {
			const result = buildClassList('one', 'two', 'two', 'three', 'one');
			expect(result).toEqual(['one', 'two', 'three']);
		});

		test('handles array arguments', () => {
			const result = buildClassList(['one', 'two'], ['three', 'four']);
			expect(result).toEqual(['one', 'two', 'three', 'four']);
		});

		test('handles deeply nested arrays', () => {
			const result = buildClassList([[['one', 'two']]], 'three', ['four', [['five']]]);
			expect(result).toEqual(['one', 'two', 'three', 'four', 'five']);
		});

		test('filters out non-string values', () => {
			const result = buildClassList('one', 2, 'three', null, undefined, false, 'four');
			expect(result).toEqual(['one', 'three', 'four']);
		});

		test('filters out empty and whitespace-only strings', () => {
			const result = buildClassList('one', '', '   ', 'two', '\t\n', 'three');
			expect(result).toEqual(['one', 'two', 'three']);
		});

		test('handles mixed valid and invalid inputs', () => {
			const result = buildClassList(
				'valid',
				['array', 'items'],
				123,
				'',
				'   ',
				null,
				[undefined, 'nested-valid'],
				'final',
			);
			expect(result).toEqual(['valid', 'array', 'items', 'nested-valid', 'final']);
		});

		test('preserves strings with content and whitespace', () => {
			const result = buildClassList('  leading', 'trailing  ', '  both  ');
			expect(result).toEqual(['  leading', 'trailing  ', '  both  ']);
		});

		test('handles empty input', () => {
			expect(buildClassList()).toEqual([]);
			expect(buildClassList([])).toEqual([]);
			expect(buildClassList('', null, undefined)).toEqual([]);
		});

		test('preserves order while removing duplicates', () => {
			const result = buildClassList('first', 'second', 'first', 'third', 'second');
			expect(result).toEqual(['first', 'second', 'third']);
		});

		test('handles edge case whitespace patterns', () => {
			const result = buildClassList('valid', ' ', '\t', '\n', '  \t  ', 'has content', '   has   content   ');
			expect(result).toEqual(['valid', 'has content', '   has   content   ']);
		});
	});

	describe('integration scenarios', () => {
		test('demonstrates CSS class creation workflow', () => {
			const baseClass = classSafeNanoid();
			const modifiers = ['hover', 'active'];
			const userClasses = ['user-defined', '  spaced  '];
			const conditionals = userClasses.length > 1 ? ['enabled'] : ['disabled'];

			const finalClasses = buildClassList(baseClass, modifiers, userClasses, conditionals, '', null);

			expect(finalClasses).toContain(baseClass);
			expect(finalClasses).toContain('hover');
			expect(finalClasses).toContain('active');
			expect(finalClasses).toContain('user-defined');
			expect(finalClasses).toContain('  spaced  ');
			expect(finalClasses).toContain('enabled');
			expect(finalClasses).not.toContain('disabled');
			expect(finalClasses).not.toContain('');
			expect(finalClasses).not.toContain(null);
		});
	});

	describe('edge cases and error handling', () => {
		test('handles extremely nested arrays', () => {
			const deepNested = [[[[['deep', 'nested'], 'values']], 'more']];
			const result = buildClassList(deepNested, 'shallow');
			expect(result).toEqual(['deep', 'nested', 'values', 'more', 'shallow']);
		});

		test('handles circular references gracefully', () => {
			const nested = [];
			let current = nested;

			for (let i = 0; i < 10; i++) {
				const next = [`level-${i}`];
				current.push(next);
				current = next;
			}

			expect(() => buildClassList(nested)).not.toThrow();
		});

		test('handles very long class names', () => {
			const longClassName = 'a'.repeat(1000);
			const result = buildClassList('short', longClassName, 'another');
			expect(result).toEqual(['short', longClassName, 'another']);
		});

		test('handles special characters in class names', () => {
			const specialClasses = ['class-with-dashes', 'class_with_underscore', 'class123', 'ClassName'];
			const result = buildClassList(specialClasses);
			expect(result).toEqual(specialClasses);
		});

		test('handles mixed data types in nested arrays', () => {
			const mixed = [
				['valid', 123, 'string'],
				[null, undefined, false, true],
				['another', ['nested', 456]],
			];
			const result = buildClassList(mixed, 'final');
			expect(result).toEqual(['valid', 'string', 'another', 'nested', 'final']);
		});
	});
});
