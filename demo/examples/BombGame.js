import { Elem, Button, randInt, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './BombGame.js.asText';

// Higher numbers are easier (Suggestion: Easy: 1000 | Medium: 700 | Hard: 500)
const DIFFICULTY = 700;

const Bomb = styled.Icon`
	position: absolute;
	display: none;
	justify-content: center;
	align-items: center;

	&.set {
		display: flex;
	}

	&.explode {
		font-size: 66px !important;
		color: ${({ colors }) => colors.red};
		transition: color 300ms;
		pointer-events: none;
	}
`;

class BombGame extends (styled.Component`
	height: 100%;
	display: flex;
	flex-direction: column;

	&.minefield {
		position: relative;
		flex: 1;
		background-color: ${({ colors }) => colors.black};
	}
`) {
	render() {
		this._score = new Elem();
		this._time = new Elem();
		this._playPause = new Button(
			{ onPointerPress: () => (this.options.paused = !(this.options.paused ?? true)) },
			'Play',
		);
		this._minefield = new Elem({ className: 'minefield' });
		this._bomb = new Bomb({
			icon: 'bomb',
			animation: 'shake',
			appendTo: this._minefield,
			onPointerPress: () => this.diffuseBomb(),
		});

		this.content([this._score, this._time, this._playPause, this._minefield]);

		super.render();
	}

	_setOption(key, value) {
		if (key === 'score') this._score.content(`Score: ${value}`);
		else if (key === 'time') this._time.content(`Time Remaining: ${(value / 1000).toFixed(1)}s`);
		else if (key === 'paused') this[value ? 'pause' : 'play']();
		else super._setOption(key, value);
	}

	play() {
		if ((this.options.time ?? 0) <= 0) {
			this.options.score = 0;
			this.options.time = 3e4;
		}

		this.timer = setInterval(() => {
			this.options.time -= 100;
			if (this.options.time <= 0) this.options.paused = true;
		}, 100);

		this.setBomb();
		this._playPause.content('Pause');
	}

	pause() {
		clearInterval(this.timer);
		clearTimeout(this.bombDelay);
		clearTimeout(this._bomb.fuse);

		this._bomb.removeClass('set');
		this._playPause.content('Play');
		this._time.content(this.options.time === 3e4 ? '' : `Paused: ${(this.options.time / 1000).toFixed(1)}s`);
	}

	setBomb(delayTime) {
		if (delayTime) {
			this.bombDelay = setTimeout(() => this.setBomb(), delayTime);

			return;
		}

		this.setTime = performance.now();
		this.burnTime = DIFFICULTY + Math.floor(this.options.time / 100) * 2;

		this._bomb.options.icon = 'bomb';
		this._bomb
			.removeClass('explode')
			.addClass('set')
			.setStyle({
				top: `${randInt(3, 97)}%`,
				left: `${randInt(3, 97)}%`,
				fontSize: `${randInt(16, 32)}px`,
			});
		this._bomb.fuse = setTimeout(() => this.explodeBomb(), this.burnTime);
	}

	async explodeBomb() {
		this._bomb.addClass('explode');
		this._bomb.options.icon = 'fire';

		const sizePoints = Math.pow(Number.parseInt(this._bomb.elem.style.fontSize), 2);
		const burnPoints = DIFFICULTY * 2 - this.burnTime;

		this.options.score -= Math.floor((sizePoints + burnPoints) / 2);

		this.setBomb(DIFFICULTY / 2 + Math.floor(this.options.time / 100) * 2);
	}

	diffuseBomb() {
		this._bomb.removeClass('set');

		clearTimeout(this.bombDelay);
		clearTimeout(this._bomb.fuse);

		const responsePoints = (this.burnTime + 100 - Math.floor(performance.now() - this.setTime)) * 2;
		const sizePoints = (60 - Number.parseInt(this._bomb.elem.style.fontSize)) * 6;

		this.options.score += responsePoints + sizePoints;

		this.setBomb();
	}
}

export default class Example extends ExampleView {
	render() {
		this.options.exampleCode = exampleCode;

		super.render();

		this.demoWrapper.setStyle({ height: '100%' });

		new BombGame({ appendTo: this.demoWrapper });
	}
}
