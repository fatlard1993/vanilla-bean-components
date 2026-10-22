import {
	Button,
	Card,
	Component,
	Content,
	EmptyState,
	Input,
	Label,
	Link,
	Notify,
	SectionLabel,
	Select,
	Tabs,
	Toolbar,
	View,
	delay,
	styled,
	theme,
} from '../..';

const fields = [
	{ name: 'North 80', acres: 80, tenure: 'owned', note: 'winter wheat', accent: theme.colors.green },
	{
		name: 'Creek bottom',
		acres: 34,
		tenure: 'leased',
		note: 'needs drainage',
		accent: theme.colors.yellow,
		needsWork: true,
	},
	{ name: 'Home quarter', acres: 160, tenure: 'owned', note: 'soybeans', accent: theme.colors.blue },
	{
		name: 'Section 9',
		acres: 40,
		tenure: 'leased',
		note: 'fence down',
		accent: theme.colors.orange,
		needsWork: true,
	},
];

const firstNotes = [
	{ field: 'Creek bottom', text: 'Standing water by the culvert after Tuesday' },
	{ field: 'North 80', text: 'Stand looks even; top-dress in March' },
];

const people = [
	{ name: 'Dale', role: 'owner' },
	{ name: 'Rosa', role: 'custom sprayer' },
	{ name: 'Mike', role: 'landlord, Creek bottom and Section 9' },
];

const quickLinks = [
	['Radar', 'https://radar.weather.gov'],
	['Soil survey', 'https://websoilsurvey.nrcs.usda.gov'],
	['Market news', 'https://www.ams.usda.gov/market-news'],
];

// The forecast is made up and arrives late, as it would from a weather service
const fetchForecast = async () => {
	await delay(4000);

	return [
		['Mon', '0.0"'],
		['Tue', '0.4"'],
		['Wed', '1.1"'],
		['Thu', '0.2"'],
		['Fri', '0.0"'],
	];
};

const Columns = styled.Component(
	({ media }) => `
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 24px;
		align-items: start;
		margin-top: 16px;

		@media ${media.phone} {
			grid-template-columns: 1fr;
		}
	`,
);

const Stack = styled.Component(
	() => `
		display: flex;
		flex-direction: column;
		gap: 8px;
	`,
);

const Meta = styled.Component(
	({ colors }) => `
		color: ${colors.muted};
		font-size: 0.85em;
	`,
);

const recordCard = (title, meta, accent) =>
	new Card({ accent }, new Component({ textContent: title }), new Meta({ textContent: meta }));

// A page an app would have, not a demo of one: it fills the view rather than sitting in the Demo box
export default class Showcase extends View {
	build() {
		let filter = 'all';
		let search = '';

		const fieldList = new Stack();
		const renderFields = () => {
			const shown = fields.filter(
				field =>
					(filter === 'all' || (filter === 'needsWork' ? field.needsWork : field.tenure === filter)) &&
					field.name.toLowerCase().includes(search),
			);

			fieldList.content(
				shown.length
					? shown.map(({ name, acres, tenure, note, accent }) =>
							recordCard(name, `${acres} ac · ${tenure} · ${note}`, accent),
						)
					: new EmptyState({ icon: 'magnifying-glass', title: 'No fields match' }),
			);
		};

		renderFields();

		const chips = new Toolbar({ gap: 8, style: { margin: 0 } });
		const chipFor = (id, label) => {
			const chip = new Button({
				variant: 'chip',
				textContent: label,
				appendTo: chips,
				onPointerPress: () => {
					filter = id;
					chips.elem.querySelector('.selected')?.classList.remove('selected');
					chip.addClass('selected');
					renderFields();
				},
			});

			if (id === filter) chip.addClass('selected');
		};

		chipFor('all', 'All');
		chipFor('owned', 'Owned');
		chipFor('leased', 'Leased');
		chipFor('needsWork', 'Needs work');

		const forecast = new Card({}, new EmptyState({ loading: true, title: 'Loading the forecast' }));

		fetchForecast().then(days =>
			forecast.content(
				new Toolbar({
					wrap: false,
					style: { margin: 0, justifyContent: 'space-between' },
					append: days.map(([day, rain]) => new Stack({ append: [new Meta({ textContent: day }), rain] })),
				}),
			),
		);

		const notes = [...firstNotes];
		const noteList = new Stack();
		const renderNotes = () =>
			noteList.content(notes.map(({ field, text }) => recordCard(text, field, theme.colors.gray)));

		renderNotes();

		const noteField = new Select({ options: fields.map(({ name }) => name), value: 'Creek bottom' });
		const noteText = new Input({ value: 'Tile outlet is silted over again' });

		const searchInput = new Input({
			placeholder: 'Search fields',
			style: { flex: '1', minWidth: '10em', width: 'auto' },
			onKeyUp: ({ target: { value } }) => {
				search = value.toLowerCase();
				renderFields();
			},
		});

		const fieldsPanel = new Component({
			append: [
				new Toolbar({
					style: { margin: '12px 0 8px' },
					append: [
						new Button({ icon: 'plus', textContent: 'Add field' }),
						new Button({ textContent: 'Import', variant: 'flat' }),
						searchInput,
						new Tabs({
							variant: 'segmented',
							tabs: [
								{ id: 'list', label: 'List', icon: 'list' },
								{ id: 'map', label: 'Map', icon: 'map' },
							],
						}),
					],
				}),
				chips,
				new Columns({
					append: [
						new Stack({
							append: [
								new SectionLabel({ textContent: 'Fields' }),
								fieldList,
								new SectionLabel({ textContent: 'Rain this week' }),
								forecast,
							],
						}),
						new Stack({
							append: [
								new SectionLabel({ textContent: 'New note' }),
								new Card(
									{},
									new Label({ label: 'Field' }, noteField),
									new Label({ label: 'Note' }, noteText),
									new Toolbar({
										gap: 8,
										style: { margin: '8px 0 0' },
										append: [
											new Button({
												icon: 'check',
												textContent: 'Save',
												onPointerPress: () => {
													if (!noteText.elem.value) return;

													notes.unshift({ field: noteField.elem.value, text: noteText.elem.value });
													noteText.options.value = '';
													renderNotes();
													new Notify({ type: 'success', content: 'Note saved' });
												},
											}),
											new Button({
												textContent: 'Cancel',
												variant: 'flat',
												onPointerPress: () => (noteText.options.value = ''),
											}),
										],
									}),
								),
								new SectionLabel({ textContent: 'Quick links' }),
								new Toolbar({
									gap: 8,
									style: { margin: 0 },
									append: quickLinks.map(
										([textContent, href]) =>
											new Link({
												variant: 'raised',
												textContent,
												href,
												attributes: { target: '_blank' },
											}),
									),
								}),
							],
						}),
					],
				}),
			],
		});

		const panels = {
			fields: fieldsPanel,
			notes: new Component({ style: { marginTop: '12px' }, append: noteList }),
			people: new Stack({
				style: { marginTop: '12px' },
				append: people.map(({ name, role }) => recordCard(name, role)),
			}),
		};

		this.content([
			new Toolbar({
				variant: 'bar',
				heading: 'Field log',
				append: [
					new Button({
						icon: 'arrow-left',
						variant: 'flat',
						addClass: 'start',
						title: 'Back',
						onPointerPress: () => history.back(),
					}),
					new Button({
						icon: 'magnifying-glass',
						variant: 'flat',
						title: 'Search',
						onPointerPress: () => searchInput.elem.focus(),
					}),
					new Button({ icon: 'gear', variant: 'flat', title: 'Settings' }),
				],
			}),
			new Content({
				column: 1000,
				style: { paddingBlock: '12px' },
				append: [
					new Tabs({
						tabs: [
							{ id: 'fields', label: 'Fields', count: fields.length },
							{ id: 'notes', label: 'Notes' },
							{ id: 'people', label: 'People', count: people.length },
						],
						panels,
					}),
					...Object.values(panels),
				],
			}),
		]);
	}
}
