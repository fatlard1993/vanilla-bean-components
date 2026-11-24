import DemoView from '../../demo/DemoView';
import { EmptyState } from '.';

// The 'augmented' loader is drawn by augmented-ui, which an app with that look loads itself
const augmentedUiCSS = 'https://unpkg.com/augmented-ui@2.0.0/augmented-ui.min.css';

export default class Demo extends DemoView {
	build() {
		this.component = new EmptyState({
			icon: 'seedling',
			title: 'No fields yet',
			message: 'Fields you draw on the map show up here.',
			action: { textContent: 'Draw a field', onPointerPress: () => console.log('draw') },
		});

		new EmptyState({ appendTo: this.demoWrapper, loading: true, title: 'Loading fields' });

		if (!document.querySelector(`link[href="${augmentedUiCSS}"]`)) {
			document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: augmentedUiCSS }));
		}

		new EmptyState({ appendTo: this.demoWrapper, loading: true, loader: 'augmented', title: 'Booting' });
	}
}
