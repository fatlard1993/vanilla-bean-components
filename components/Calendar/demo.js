import DemoView from '../../demo/DemoView';
import theme from '../../theme';
import { Calendar } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Calendar({
			view: 'month',
			onDayPress: ({ detail: { date } }) => console.log('dayPress', date.toDateString()),
			onTimePress: ({ detail: { date } }) => console.log('timePress', date.toLocaleTimeString()),
			onEventPress: ({ detail: { calendarEvent } }) => console.log('eventPress', calendarEvent.label),
		});

		this.component.addEvent({
			at: Date.now(),
			label: 'test',
			color: theme.colors.purple,
			duration: 60 * 60 * 1000,
		});
	}
}
