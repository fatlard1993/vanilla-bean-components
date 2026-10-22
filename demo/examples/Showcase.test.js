import Showcase from './Showcase.js';

const buttonNamed = (view, name) =>
	[...view.elem.querySelectorAll('button')].find(button => button.textContent.trim().startsWith(name));

// A field's card has its name over "<acres> ac · <tenure> · <note>"; a note's and a person's don't
const fieldsShown = view =>
	[...view.elem.querySelectorAll('.accented')]
		.filter(card => card.lastElementChild.textContent.includes(' ac · '))
		.map(card => card.firstElementChild.textContent);

describe('Showcase', () => {
	let view;

	afterEach(() => {
		view?.destroy?.();
		view = null;
		document.body.replaceChildren();
	});

	test('opens on the four fields, a form already filled in and the forecast loading: nothing starts empty', () => {
		view = new Showcase({ appendTo: document.body });

		expect(fieldsShown(view)).toEqual(['North 80', 'Creek bottom', 'Home quarter', 'Section 9']);
		expect(view.elem.querySelector('select').value).toBe('Creek bottom');
		expect(view.elem.textContent).toContain('Loading the forecast');
	});

	test('a filter chip narrows the fields and is the one marked selected', () => {
		view = new Showcase({ appendTo: document.body });

		buttonNamed(view, 'Leased').click();

		expect(fieldsShown(view)).toEqual(['Creek bottom', 'Section 9']);
		expect(buttonNamed(view, 'Leased').classList.contains('selected')).toBe(true);
		expect(buttonNamed(view, 'All').classList.contains('selected')).toBe(false);
	});

	test('Save puts the note at the top of Notes and clears the field', () => {
		view = new Showcase({ appendTo: document.body });

		const note = [...view.elem.querySelectorAll('input')].find(input => input.placeholder !== 'Search fields');
		const notes = () => [...view.elem.querySelectorAll('.accented')].map(card => card.textContent);

		expect(notes()).not.toContain('Tile outlet is silted over againCreek bottom');

		buttonNamed(view, 'Save').click();

		expect(note.value).toBe('');
		expect(notes()).toContain('Tile outlet is silted over againCreek bottom');
	});

	test('the quick links are raised keys that open outside the app', () => {
		view = new Showcase({ appendTo: document.body });

		const links = [...view.elem.querySelectorAll('a.variant-raised')];

		expect(links.map(link => link.textContent)).toEqual(['Radar', 'Soil survey', 'Market news']);
		links.forEach(link => expect(link.target).toBe('_blank'));
	});
});
