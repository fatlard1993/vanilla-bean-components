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

	describe('data context creation', () => {
		test('creates a Context from initial data', () => {
			const form = new Form({
				data: { name: 'Alice', age: 30 },
				inputs: [{ key: 'name' }, { key: 'age' }],
				appendTo: container,
			});

			expect(form.options.data).toBeDefined();
			expect(form.options.data.name).toBe('Alice');
			expect(form.options.data.age).toBe(30);
		});

		test('creates a Context even when no initial data is provided', () => {
			const form = new Form({
				inputs: [{ key: 'title' }],
				appendTo: container,
			});

			// data should exist and the key should be set to the input's default value
			expect(form.options.data).toBeDefined();
		});

		test('data context reflects initial input values', () => {
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
		test('onChange updates data context', () => {
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

	describe('validate()', () => {
		test('returns false when there are no inputElements', () => {
			const form = new Form({ appendTo: container });

			expect(form.validate()).toBe(false);
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

			const result = form.validate();

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

			const result = form.validate();

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

			const result = form.validate();

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
			expect(form.validate()).toBe(true);

			// Fix the value
			form.options.data.name = 'Alice';
			form.inputElements.name.options.value = 'Alice';

			// Now valid
			expect(form.validate()).toBe(false);
		});

		test('marks invalid inputs with validationErrors class', () => {
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

			form.validate();

			expect(form.inputElements.name.elem.className).toContain('validationErrors');
		});

		test('clears validationErrors class on valid input', () => {
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

			form.validate();

			expect(form.inputElements.name.elem.className).not.toContain('validationErrors');
		});
	});

	describe('input type', () => {
		// Form passes a Subscriber object (not the raw value) to InputComponent, so
		// Input's dataTypeToInputType inference always sees typeof === 'object' and
		// falls back to 'text'. Explicit type options are required to override this.
		test('defaults to text type when no type is specified', () => {
			const form = new Form({
				data: { age: 25 },
				inputs: [{ key: 'age' }],
				appendTo: container,
			});

			expect(form.inputElements.age.elem.type).toBe('text');
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
});
