import { describe, test, expect, afterEach } from 'bun:test';
import { findByText } from '@testing-library/dom';

import { Input } from '../Input';
import { Form } from '.';

afterEach(() => {
	document.body.replaceChildren();
});

describe('Form', () => {
	describe('basic rendering', () => {
		test('renders without inputs', () => {
			const form = new Form({ appendTo: container });

			expect(form.elem).toBeDefined();
			expect(form.elem.tagName).toBe('DIV');
		});

		test('renders nothing extra when inputs array is empty', () => {
			const form = new Form({ inputs: [], appendTo: container });

			// No label/input pairs should have been created
			expect(form.inputElements).toBeUndefined();
		});

		test('renders a label for each input config entry', async () => {
			new Form({
				inputs: [{ key: 'firstName' }, { key: 'lastName' }],
				appendTo: container,
			});

			// Labels are inferred from keys via fromCamelCase + capitalize
			await findByText(container, 'First Name');
			await findByText(container, 'Last Name');
		});

		test('uses explicit label when provided', async () => {
			new Form({
				inputs: [{ key: 'email', label: 'Email Address' }],
				appendTo: container,
			});

			await findByText(container, 'Email Address');
		});

		test('creates inputElements map keyed by field key', () => {
			const form = new Form({
				inputs: [{ key: 'name' }, { key: 'age' }],
				appendTo: container,
			});

			expect(form.inputElements).toBeDefined();
			expect(form.inputElements.name).toBeDefined();
			expect(form.inputElements.age).toBeDefined();
		});

		test('inputElements are Input instances by default', () => {
			const form = new Form({
				inputs: [{ key: 'name' }],
				appendTo: container,
			});

			expect(form.inputElements.name).toBeInstanceOf(Input);
		});
	});

	describe('data store creation', () => {
		test('creates a reactive store from initial data', () => {
			const form = new Form({
				data: { name: 'Alice', age: 30 },
				inputs: [{ key: 'name' }, { key: 'age' }],
				appendTo: container,
			});

			expect(form.options.data).toBeDefined();
			expect(form.options.data.name).toBe('Alice');
			expect(form.options.data.age).toBe(30);
		});

		test('creates a reactive store even when no initial data is provided', () => {
			const form = new Form({
				inputs: [{ key: 'title' }],
				appendTo: container,
			});

			// data should exist and the key should be set to the input's default value
			expect(form.options.data).toBeDefined();
		});

		test('data store reflects initial input values', () => {
			const form = new Form({
				data: { username: 'jdoe' },
				inputs: [{ key: 'username' }],
				appendTo: container,
			});

			expect(form.options.data.username).toBe('jdoe');
		});

		test('input reflects initial data value', () => {
			const form = new Form({
				data: { score: 42 },
				inputs: [{ key: 'score' }],
				appendTo: container,
			});

			expect(form.inputElements.score.options.value).toBe(42);
		});
	});

	describe('reactive data binding', () => {
		test('onChange updates data store', () => {
			const form = new Form({
				data: { name: 'Alice' },
				inputs: [{ key: 'name' }],
				appendTo: container,
			});

			const input = form.inputElements.name;

			// Simulate what onChange does internally (event with .value)
			input.options.onChange?.call(input, { value: 'Bob' });

			expect(form.options.data.name).toBe('Bob');
		});

		test('parse function transforms the incoming value', () => {
			const form = new Form({
				data: { count: 0 },
				inputs: [{ key: 'count', parse: value => Number.parseInt(value, 10) }],
				appendTo: container,
			});

			const input = form.inputElements.count;

			input.options.onChange?.call(input, { value: '7' });

			expect(form.options.data.count).toBe(7);
		});

		test('custom onChange callback is invoked alongside data update', () => {
			let callbackCalled = false;
			let callbackEvent = null;

			const form = new Form({
				data: { field: '' },
				inputs: [
					{
						key: 'field',
						onChange: event => {
							callbackCalled = true;
							callbackEvent = event;
						},
					},
				],
				appendTo: container,
			});

			const input = form.inputElements.field;

			input.options.onChange?.call(input, { value: 'hello' });

			expect(callbackCalled).toBe(true);
			expect(callbackEvent.value).toBe('hello');
			expect(form.options.data.field).toBe('hello');
		});
	});

	describe('hasErrors()', () => {
		test('returns false when there are no inputElements', () => {
			const form = new Form({ appendTo: container });

			expect(form.hasErrors()).toBe(false);
		});

		test('returns false when all inputs are valid', () => {
			const form = new Form({
				data: { name: 'Alice' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			const result = form.hasErrors();

			expect(result).toBe(false);
		});

		test('returns true when any input is invalid', () => {
			const form = new Form({
				data: { name: '' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			const result = form.hasErrors();

			expect(result).toBe(true);
		});

		test('validates all inputs and collects errors across fields', () => {
			const form = new Form({
				data: { name: '', email: '' },
				inputs: [
					{ key: 'name', validations: [[/.+/, 'Name is required']] },
					{ key: 'email', validations: [[/.+/, 'Email is required']] },
				],
				appendTo: container,
			});

			const result = form.hasErrors();

			expect(result).toBe(true);
		});

		test('returns false when all inputs pass validation after partial failure', () => {
			const form = new Form({
				data: { name: '' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			// Initially invalid
			expect(form.hasErrors()).toBe(true);

			// Fix the value
			form.options.data.name = 'Alice';
			form.inputElements.name.options.value = 'Alice';

			// Now valid
			expect(form.hasErrors()).toBe(false);
		});

		test('marks invalid inputs with validation-errors class', () => {
			const form = new Form({
				data: { name: '' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			form.hasErrors();

			expect(form.inputElements.name.elem.className).toContain('validation-errors');
		});

		test('clears validation-errors class on valid input', () => {
			const form = new Form({
				data: { name: 'Alice' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			form.hasErrors();

			expect(form.inputElements.name.elem.className).not.toContain('validation-errors');
		});
	});

	describe('input type', () => {
		// Input sees through Subscriber via __isSubscriber + toJSON() and infers the type
		// from the underlying data value. Numeric data → number input; boolean → checkbox; etc.
		// Override with an explicit type option when the inferred type is wrong for your use case.
		test('infers type from underlying data value when passed a subscriber', () => {
			const form = new Form({
				data: { age: 25 },
				inputs: [{ key: 'age' }],
				appendTo: container,
			});

			expect(form.inputElements.age.elem.type).toBe('number');
		});

		test('respects an explicit type option', () => {
			const form = new Form({
				data: { age: 25 },
				inputs: [{ key: 'age', type: 'number' }],
				appendTo: container,
			});

			expect(form.inputElements.age.elem.type).toBe('number');
		});

		test('respects checkbox type when explicitly set', () => {
			const form = new Form({
				data: { active: true },
				inputs: [{ key: 'active', type: 'checkbox' }],
				appendTo: container,
			});

			expect(form.inputElements.active.elem.type).toBe('checkbox');
		});
	});

	describe('custom InputComponent', () => {
		test('accepts a custom InputComponent class', () => {
			// Use Input itself with overridden options as a stand-in
			const form = new Form({
				data: { name: 'test' },
				inputs: [{ key: 'name', InputComponent: Input }],
				appendTo: container,
			});

			expect(form.inputElements.name).toBeInstanceOf(Input);
		});

		test('passes extra inputOptions to the InputComponent', () => {
			const form = new Form({
				data: { note: '' },
				inputs: [{ key: 'note', tag: 'textarea' }],
				appendTo: container,
			});

			expect(form.inputElements.note.elem.tagName).toBe('TEXTAREA');
		});
	});

	describe('overflow style', () => {
		test('applies overflow style when inputs are present', () => {
			const form = new Form({
				inputs: [{ key: 'field' }],
				appendTo: container,
			});

			expect(form.elem.style.overflow).toBe('hidden auto');
		});
	});

	describe('conditional fields', () => {
		test('hidden when condition returns false at render time', () => {
			const form = new Form({
				data: { type: 'basic', extra: '' },
				inputs: [
					{ key: 'type' },
					{ key: 'extra', condition: data => data.type === 'advanced' },
				],
				appendTo: container,
			});

			// eslint-disable-next-line testing-library/no-node-access
			const wrapper = form.inputElements.extra.elem.parentElement;
			expect(wrapper.style.display).toBe('none');
		});

		test('visible when condition returns true at render time', () => {
			const form = new Form({
				data: { type: 'advanced', extra: '' },
				inputs: [
					{ key: 'type' },
					{ key: 'extra', condition: data => data.type === 'advanced' },
				],
				appendTo: container,
			});

			// eslint-disable-next-line testing-library/no-node-access
			const wrapper = form.inputElements.extra.elem.parentElement;
			expect(wrapper.style.display).not.toBe('none');
		});

		test('shows field when data change satisfies condition', () => {
			const form = new Form({
				data: { type: 'basic', extra: '' },
				inputs: [
					{ key: 'type' },
					{ key: 'extra', condition: data => data.type === 'advanced' },
				],
				appendTo: container,
			});

			// eslint-disable-next-line testing-library/no-node-access
			const wrapper = form.inputElements.extra.elem.parentElement;
			expect(wrapper.style.display).toBe('none');

			form.options.data.type = 'advanced';

			expect(wrapper.style.display).not.toBe('none');
		});

		test('hides field when data change fails condition', () => {
			const form = new Form({
				data: { type: 'advanced', extra: '' },
				inputs: [
					{ key: 'type' },
					{ key: 'extra', condition: data => data.type === 'advanced' },
				],
				appendTo: container,
			});

			// eslint-disable-next-line testing-library/no-node-access
			const wrapper = form.inputElements.extra.elem.parentElement;
			expect(wrapper.style.display).not.toBe('none');

			form.options.data.type = 'basic';

			expect(wrapper.style.display).toBe('none');
		});

		test('hasErrors() skips hidden conditional fields', () => {
			const form = new Form({
				data: { type: 'basic', required: '' },
				inputs: [
					{ key: 'type' },
					{
						key: 'required',
						condition: data => data.type === 'advanced',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			// 'required' field is hidden — hasErrors should ignore it
			expect(form.hasErrors()).toBe(false);
		});

		test('hasErrors() validates revealed conditional fields', () => {
			const form = new Form({
				data: { type: 'advanced', required: '' },
				inputs: [
					{ key: 'type' },
					{
						key: 'required',
						condition: data => data.type === 'advanced',
						validations: [[/.+/, 'Required']],
					},
				],
				appendTo: container,
			});

			// 'required' field is visible and empty — should fail
			expect(form.hasErrors()).toBe(true);
		});
	});

	describe('field-level validate', () => {
		test('validate() returning a string marks field invalid', () => {
			const form = new Form({
				data: { age: 5 },
				inputs: [{ key: 'age', validate: value => (value >= 18 ? null : 'Must be 18+') }],
				appendTo: container,
			});

			expect(form.hasErrors()).toBe(true);
			expect(form.inputElements.age.elem.classList.contains('validation-errors')).toBe(true);
			expect(form.inputElements.age.elem.getAttribute('aria-invalid')).toBe('true');
		});

		test('validate() returning null marks field valid', () => {
			const form = new Form({
				data: { age: 21 },
				inputs: [{ key: 'age', validate: value => (value >= 18 ? null : 'Must be 18+') }],
				appendTo: container,
			});

			expect(form.hasErrors()).toBe(false);
			expect(form.inputElements.age.elem.classList.contains('validation-errors')).toBe(false);
			expect(form.inputElements.age.elem.getAttribute('aria-invalid')).toBeNull();
		});

		test('field validate and VBC validations both run', () => {
			const form = new Form({
				data: { name: '' },
				inputs: [
					{
						key: 'name',
						validations: [[/.+/, 'Cannot be empty']],
						validate: value => (value.length > 50 ? 'Too long' : null),
					},
				],
				appendTo: container,
			});

			// Empty fails VBC validation
			expect(form.hasErrors()).toBe(true);
		});
	});

	describe('group layout', () => {
		test('renders grouped fields inside a shared container', () => {
			const form = new Form({
				data: { first: '', last: '' },
				inputs: [
					{
						type: 'group',
						style: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
						inputs: [{ key: 'first' }, { key: 'last' }],
					},
				],
				appendTo: container,
			});

			expect(form.inputElements.first).toBeDefined();
			expect(form.inputElements.last).toBeDefined();

			// input.elem → label wrapper → group container — both share the same group
			// eslint-disable-next-line testing-library/no-node-access
			const firstGroup = form.inputElements.first.elem.parentElement?.parentElement;
			// eslint-disable-next-line testing-library/no-node-access
			const lastGroup = form.inputElements.last.elem.parentElement?.parentElement;
			expect(firstGroup).toBe(lastGroup);
			expect(firstGroup).not.toBe(form.elem);
		});

		test('group container collapses when all conditional children hide', () => {
			const form = new Form({
				data: { show: true, a: '', b: '' },
				inputs: [
					{
						type: 'group',
						inputs: [
							{ key: 'a', condition: data => data.show },
							{ key: 'b', condition: data => data.show },
						],
					},
				],
				appendTo: container,
			});

			// input.elem → label wrapper → group container
			// eslint-disable-next-line testing-library/no-node-access
			const groupElem = form.inputElements.a.elem.parentElement.parentElement;

			// Initially all visible — group is not collapsed
			expect(groupElem.style.display).not.toBe('none');

			// Hide all conditional children — _evaluateConditions collapses the group
			form.options.data.show = false;

			expect(groupElem.style.display).toBe('none');
		});

		test('group container expands when a conditional child becomes visible', () => {
			const form = new Form({
				data: { show: true, a: '' },
				inputs: [
					{
						type: 'group',
						inputs: [{ key: 'a', condition: data => data.show }],
					},
				],
				appendTo: container,
			});

			// eslint-disable-next-line testing-library/no-node-access
			const groupElem = form.inputElements.a.elem.parentElement.parentElement;

			form.options.data.show = false;
			expect(groupElem.style.display).toBe('none');

			form.options.data.show = true;
			expect(groupElem.style.display).not.toBe('none');
		});
	});
});
