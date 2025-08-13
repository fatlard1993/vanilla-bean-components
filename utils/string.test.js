import { capitalize, fromCamelCase, toCamelCase, toPascalCase, removeExcessIndentation } from './string';

describe('string utilities', () => {
	describe('capitalize', () => {
		test('capitalizes first letter of single word', () => {
			expect(capitalize('hello')).toBe('Hello');
			expect(capitalize('world')).toBe('World');
			expect(capitalize('test')).toBe('Test');
		});

		test('handles already capitalized strings', () => {
			expect(capitalize('Hello')).toBe('Hello');
			expect(capitalize('WORLD')).toBe('WORLD');
		});

		test('handles empty and single character strings', () => {
			expect(capitalize('')).toBe('');
			expect(capitalize('a')).toBe('A');
			expect(capitalize('z')).toBe('Z');
		});

		test('capitalizes only first word by default', () => {
			expect(capitalize('hello world')).toBe('Hello world');
			expect(capitalize('the quick brown fox')).toBe('The quick brown fox');
		});

		test('capitalizes all words when recursive is true', () => {
			expect(capitalize('hello world', true)).toBe('Hello World');
			expect(capitalize('the quick brown fox', true)).toBe('The Quick Brown Fox');
			expect(capitalize('one two three four', true)).toBe('One Two Three Four');
		});

		test('uses custom split character', () => {
			expect(capitalize('hello-world-test', true, '-')).toBe('Hello-World-Test');
			expect(capitalize('one_two_three', true, '_')).toBe('One_Two_Three');
			expect(capitalize('a|b|c|d', true, '|')).toBe('A|B|C|D');
		});

		test('handles mixed case with recursive option', () => {
			expect(capitalize('hELLO wORLD', true)).toBe('HELLO WORLD');
			expect(capitalize('tEST cASE', true)).toBe('TEST CASE');
		});

		test('handles strings with numbers and special characters', () => {
			expect(capitalize('123abc')).toBe('123abc');
			expect(capitalize('!hello')).toBe('!hello');
			expect(capitalize('hello123 world456', true)).toBe('Hello123 World456');
		});

		test('handles multiple spaces and edge cases', () => {
			expect(capitalize('  hello  world  ', true)).toBe('  Hello  World  ');
			expect(capitalize('hello  world', true)).toBe('Hello  World');
		});

		test('preserves whitespace with custom split', () => {
			expect(capitalize('hello\tworld\ntest', true, '\t')).toBe('Hello\tWorld\ntest');
			expect(capitalize('a\n\nb\n\nc', true, '\n')).toBe('A\n\nB\n\nC');
		});

		test('handles non-alphabetic strings gracefully', () => {
			expect(capitalize('123')).toBe('123');
			expect(capitalize('!@#$%')).toBe('!@#$%');
			expect(capitalize('   ')).toBe('   ');
		});
	});

	describe('fromCamelCase', () => {
		test('converts camelCase to space-separated words', () => {
			expect(fromCamelCase('camelCase')).toBe('camel Case');
			expect(fromCamelCase('myVariableName')).toBe('my Variable Name');
			expect(fromCamelCase('firstName')).toBe('first Name');
		});

		test('handles PascalCase', () => {
			expect(fromCamelCase('PascalCase')).toBe('Pascal Case');
			expect(fromCamelCase('MyComponent')).toBe('My Component');
			expect(fromCamelCase('UserAccountManager')).toBe('User Account Manager');
		});

		test('uses custom joiner', () => {
			expect(fromCamelCase('camelCase', '-')).toBe('camel-Case');
			expect(fromCamelCase('myVariableName', '_')).toBe('my_Variable_Name');
			expect(fromCamelCase('firstName', '|')).toBe('first|Name');
		});

		test('handles single word strings', () => {
			expect(fromCamelCase('hello')).toBe('hello');
			expect(fromCamelCase('Hello')).toBe('Hello');
			expect(fromCamelCase('HELLO')).toBe('HELLO');
		});

		test('handles empty and edge case strings', () => {
			expect(fromCamelCase('')).toBe('');
			expect(fromCamelCase('a')).toBe('a');
			expect(fromCamelCase('A')).toBe('A');
		});

		test('handles strings with numbers', () => {
			expect(fromCamelCase('myVar1')).toBe('my Var1');
			expect(fromCamelCase('version2Point0')).toBe('version2 Point0');
			expect(fromCamelCase('html5Parser')).toBe('html5 Parser');
		});

		test('handles consecutive uppercase letters', () => {
			expect(fromCamelCase('XMLHttpRequest')).toBe('XML Http Request');
			expect(fromCamelCase('HTMLParser')).toBe('HTML Parser');
			expect(fromCamelCase('URLPath')).toBe('URL Path');
		});

		test('handles complex camelCase patterns', () => {
			expect(fromCamelCase('getHTMLElementById')).toBe('getHTML Element By Id');
			expect(fromCamelCase('parseJSONData')).toBe('parseJSON Data');
		});

		test('preserves case of original letters', () => {
			expect(fromCamelCase('iPhone')).toBe('i Phone');
			expect(fromCamelCase('macOSApp')).toBe('macOS App');
		});
	});

	describe('toCamelCase', () => {
		test('converts space-separated words to camelCase', () => {
			expect(toCamelCase('camel case')).toBe('camelCase');
			expect(toCamelCase('my variable name')).toBe('myVariableName');
			expect(toCamelCase('first name')).toBe('firstName');
		});

		test('handles strings that start with uppercase', () => {
			expect(toCamelCase('Pascal Case')).toBe('pascalCase');
			expect(toCamelCase('My Component')).toBe('myComponent');
		});

		test('uses custom splitter', () => {
			expect(toCamelCase('kebab-case', '-')).toBe('kebabCase');
			expect(toCamelCase('snake_case', '_')).toBe('snakeCase');
			expect(toCamelCase('pipe|separated', '|')).toBe('pipeSeparated');
		});

		test('handles single word strings based on implementation', () => {
			expect(toCamelCase('hello')).toBe('hello');
			expect(toCamelCase('Hello')).toBe('hello');
			expect(toCamelCase('HELLO')).toBe('hELLO');
		});

		test('handles empty and edge case strings', () => {
			expect(toCamelCase('')).toBe('');
			expect(toCamelCase('a')).toBe('a');
			expect(toCamelCase('A')).toBe('a');
		});

		test('handles multiple consecutive separators', () => {
			expect(toCamelCase('hello  world')).toBe('helloWorld');
			expect(toCamelCase('test   case   here')).toBe('testCaseHere');
		});

		test('handles strings with numbers', () => {
			expect(toCamelCase('version 2 point 0')).toBe('version2Point0');
			expect(toCamelCase('html 5 parser')).toBe('html5Parser');
		});

		test('handles mixed case input based on implementation', () => {
			expect(toCamelCase('Mixed Case INPUT')).toBe('mixedCaseINPUT');
			expect(toCamelCase('UPPER case LOWER')).toBe('uPPERCaseLOWER');
		});

		test('preserves numbers and special characters within words', () => {
			expect(toCamelCase('item1 item2 item3')).toBe('item1Item2Item3');
			expect(toCamelCase('test123 case456')).toBe('test123Case456');
		});

		test('handles leading and trailing separators', () => {
			expect(toCamelCase(' hello world ')).toBe('HelloWorld');
			expect(toCamelCase('  test  case  ')).toBe('TestCase');
		});

		test('handles words that become empty after split', () => {
			expect(toCamelCase('hello  world')).toBe('helloWorld');
		});
	});

	describe('toPascalCase', () => {
		test('converts strings to PascalCase', () => {
			expect(toPascalCase('pascal case')).toBe('PascalCase');
			expect(toPascalCase('my component')).toBe('MyComponent');
			expect(toPascalCase('user account')).toBe('UserAccount');
		});

		test('handles camelCase input', () => {
			expect(toPascalCase('camelCase')).toBe('CamelCase');
			expect(toPascalCase('myVariableName')).toBe('MyVariableName');
		});

		test('handles already PascalCase strings', () => {
			expect(toPascalCase('PascalCase')).toBe('PascalCase');
			expect(toPascalCase('MyComponent')).toBe('MyComponent');
		});

		test('handles empty and single character strings', () => {
			expect(toPascalCase('')).toBe('');
			expect(toPascalCase('a')).toBe('A');
			expect(toPascalCase('hello')).toBe('Hello');
		});

		test('handles kebab-case and snake_case', () => {
			expect(toPascalCase('kebab-case')).toBe('Kebab-case');
			expect(toPascalCase('snake_case')).toBe('Snake_case');
		});

		test('works with numbers and mixed content', () => {
			expect(toPascalCase('version 2')).toBe('Version2');
			expect(toPascalCase('html 5 parser')).toBe('Html5Parser');
		});

		test('handles special characters', () => {
			expect(toPascalCase('hello world!')).toBe('HelloWorld!');
			expect(toPascalCase('test @case')).toBe('Test@case');
		});
	});

	describe('removeExcessIndentation', () => {
		test('returns string unchanged if no tabs', () => {
			const input = 'hello world\nno tabs here';
			expect(removeExcessIndentation(input)).toBe(input);
		});

		test('returns string unchanged if no newlines', () => {
			const input = '\t\t\ttabs but no newlines';
			expect(removeExcessIndentation(input)).toBe('tabs but no newlines');
		});

		test('removes minimum common indentation', () => {
			const input = `\t\t{\n\t\t\t\tkey: value,\n\t\t}`;
			const expected = '{\n\t\tkey: value,\n}';
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles complex nested indentation', () => {
			const input = `\t\t\tfunction test() {\n\t\t\t\tif (true) {\n\t\t\t\t\tconsole.log('hello');\n\t\t\t\t}\n\t\t\t}`;
			const expected = `function test() {\n\tif (true) {\n\t\tconsole.log('hello');\n\t}\n}`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles lines with no indentation correctly', () => {
			const input = `\t\tindented line\nno indent\n\t\t\tmore indent`;
			const expected = `indented line\nno indent\n\tmore indent`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles empty lines correctly', () => {
			const input = `\t\tline one\n\n\t\tline three`;
			const expected = `line one\n\nline three`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles mixed tabs and content', () => {
			const input = `\t\t\t\tconst x = {\n\t\t\t\t\tprop: 'value',\n\t\t\t\t\tmethod() {\n\t\t\t\t\t\treturn this.prop;\n\t\t\t\t\t}\n\t\t\t\t};`;
			const expected = `const x = {\n\tprop: 'value',\n\tmethod() {\n\t\treturn this.prop;\n\t}\n};`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles single line with tabs', () => {
			const input = `\t\t\t\t\t\t\tsingle line`;
			const expected = `single line`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles lines with different indentation levels', () => {
			const input = `\t\tlevel 2\n\t\t\tlevel 3\n\t\t\t\tlevel 4\n\t\tlevel 2 again`;
			const expected = `level 2\n\tlevel 3\n\t\tlevel 4\nlevel 2 again`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles edge case with only whitespace lines', () => {
			const input = `\t\t\n\t\t\t\n\t\t`;
			const result = removeExcessIndentation(input);
			expect(typeof result).toBe('string');
		});

		test('preserves relative indentation', () => {
			const input = `\t\t\tclass Test {\n\t\t\t\tconstructor() {\n\t\t\t\t\tthis.value = 1;\n\t\t\t\t}\n\t\t\t\n\t\t\t\tmethod() {\n\t\t\t\t\treturn this.value;\n\t\t\t\t}\n\t\t\t}`;

			const expected = `class Test {\n\tconstructor() {\n\t\tthis.value = 1;\n\t}\n\n\tmethod() {\n\t\treturn this.value;\n\t}\n}`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles strings with no common indentation', () => {
			const input = `no indent\n\tsome indent\n\t\tmore indent`;
			const expected = `no indent\nsome indent\n\tmore indent`;
			expect(removeExcessIndentation(input)).toBe(expected);
		});

		test('handles empty string', () => {
			expect(removeExcessIndentation('')).toBe('');
		});

		test('handles string with only newlines', () => {
			const input = '\n\n\n';
			expect(removeExcessIndentation(input)).toBe(input);
		});
	});

	describe('integration and real-world scenarios', () => {
		test('converts between different naming conventions', () => {
			const original = 'myVariableName';

			const spaced = fromCamelCase(original);
			const pascal = toPascalCase(spaced);

			expect(spaced).toBe('my Variable Name');
			expect(pascal).toBe('MyVariableName');
		});

		test('round trip conversions', () => {
			const original = 'hello world test';
			const camel = toCamelCase(original);
			const backToSpaced = fromCamelCase(camel);

			expect(camel).toBe('helloWorldTest');
			expect(backToSpaced).toBe('hello World Test');
		});

		test('API field name transformations', () => {
			const apiField = 'user_account_settings';
			const camelCase = toCamelCase(apiField, '_');
			const pascalCase = toPascalCase(camelCase);
			const readable = fromCamelCase(pascalCase);

			expect(camelCase).toBe('userAccountSettings');
			expect(pascalCase).toBe('UserAccountSettings');
			expect(readable).toBe('User Account Settings');
		});

		test('code formatting with removeExcessIndentation', () => {
			const messyCode = `\t\t\t\tfunction example() {\n\t\t\t\t\tconst data = {\n\t\t\t\t\t\tname: 'test',\n\t\t\t\t\t\tvalue: 42\n\t\t\t\t\t};\n\t\t\t\t\treturn data;\n\t\t\t\t}`;

			const cleaned = removeExcessIndentation(messyCode);
			const expected = `function example() {\n\tconst data = {\n\t\tname: 'test',\n\t\tvalue: 42\n\t};\n\treturn data;\n}`;

			expect(cleaned).toBe(expected);
		});

		test('title case generation', () => {
			const titles = ['hello world', 'the quick brown fox', 'javascript is awesome', 'user interface design'];

			const titleCased = titles.map(title => capitalize(title, true));

			expect(titleCased).toEqual([
				'Hello World',
				'The Quick Brown Fox',
				'Javascript Is Awesome',
				'User Interface Design',
			]);
		});

		test('CSS class name generation', () => {
			const componentName = 'UserAccountSettings';
			const kebab = fromCamelCase(componentName, '-').toLowerCase();

			expect(kebab).toBe('user-account-settings');
		});

		test('template literal formatting', () => {
			const template = `\t\t\tconst template = \`\n\t\t\t\t<div class="container">\n\t\t\t\t\t<h1>\${title}</h1>\n\t\t\t\t\t<p>\${content}</p>\n\t\t\t\t</div>\n\t\t\t\`;\n\t\t\treturn template;`;

			const formatted = removeExcessIndentation(template);
			const expected = `const template = \`\n\t<div class="container">\n\t\t<h1>\${title}</h1>\n\t\t<p>\${content}</p>\n\t</div>\n\`;\nreturn template;`;

			expect(formatted).toBe(expected);
		});

		test('handling various text transformations', () => {
			const testCases = [
				{ input: 'XMLHttpRequest', fromCamel: 'XML Http Request', toCamel: 'xMLHttpRequest' },
				{ input: 'iPhone', fromCamel: 'i Phone', toCamel: 'iPhone' },
				{ input: 'HTML5Parser', fromCamel: 'HTML5 Parser', toCamel: 'hTML5Parser' },
			];

			testCases.forEach(({ input, fromCamel, toCamel }) => {
				expect(fromCamelCase(input)).toBe(fromCamel);
				expect(toCamelCase(fromCamelCase(input))).toBe(toCamel);
			});
		});

		test('performance with large strings', () => {
			const largeString = 'word '.repeat(1000).trim();
			const largeCamelString = 'a'.repeat(500) + 'B' + 'c'.repeat(500);
			const largeIndentedString = '\t'.repeat(50) + 'content\n' + '\t'.repeat(50) + 'more content';

			const start = Date.now();

			capitalize(largeString, true);
			fromCamelCase(largeCamelString);
			toCamelCase(largeString);
			toPascalCase(largeString);
			removeExcessIndentation(largeIndentedString);

			const elapsed = Date.now() - start;
			expect(elapsed).toBeLessThan(100);
		});
	});

	describe('edge cases and error handling', () => {
		test('handles special Unicode characters', () => {
			// eslint-disable-next-line spellcheck/spell-checker
			expect(capitalize('café')).toBe('Café');

			// eslint-disable-next-line spellcheck/spell-checker
			expect(capitalize('naïve')).toBe('Naïve');

			// eslint-disable-next-line spellcheck/spell-checker
			expect(fromCamelCase('caféLatte')).toBe('café Latte');
		});

		test('handles emoji and symbols', () => {
			expect(capitalize('🚀 rocket')).toBe('🚀 rocket');
			expect(fromCamelCase('🚀RocketShip')).toBe('🚀 Rocket Ship');
		});

		test('handles very long strings', () => {
			const longString = 'a'.repeat(10000);
			expect(capitalize(longString)).toBe('A' + 'a'.repeat(9999));
			expect(toCamelCase(longString)).toBe(longString);
		});

		test('handles strings with only special characters', () => {
			expect(capitalize('!!!')).toBe('!!!');
			expect(fromCamelCase('@#$%')).toBe('@#$%');

			expect(toCamelCase('--- --- ---')).toBe('---------');
		});

		test('handles mixed newline types in removeExcessIndentation', () => {
			const mixedNewlines = '\t\tline1\r\n\t\t\tline2\n\t\tline3\r\n';
			const result = removeExcessIndentation(mixedNewlines);
			expect(typeof result).toBe('string');
			expect(result.includes('line1')).toBe(true);
		});

		test('handles empty strings correctly', () => {
			expect(capitalize('')).toBe('');
			expect(fromCamelCase('')).toBe('');
			expect(toCamelCase('')).toBe('');
			expect(removeExcessIndentation('')).toBe('');
		});
	});
});
