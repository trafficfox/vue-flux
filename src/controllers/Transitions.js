export default class TransitionsController {

	constructor(vm) {
		this.vm = vm;

		this.current = undefined;
		this.last = undefined;
		this.names = [];
		this.count = 0;
	}

	update() {
		let vm = this.vm;

		let transitions = vm.transitions;

		Object.assign(vm.$options.components, transitions);

		this.names = Object.keys(transitions);
		this.count = this.names.length;

		if (this.count > 0)
			this.last = this.count - 1;

		vm.$emit('VueFlux-TransitionsUpdated', vm);
	}

	next() {
		if (this.count === 0)
			return undefined;

		let index = this.last + 1;

		if (index >= this.count)
			index = 0;

		return this.names[index];
	}

	set(transition) {
		if (transition === undefined)
			transition = this.next();

		if (transition) {
			this.last = this.names.indexOf(transition);
			this.current = transition;
		}

		this.vm.$nextTick(() => {
			this.start(transition);
		});
	}

	setOptions(transition, transitionOptions = {}) {
		let sliderOptions = this.vm.transitionOptions[this.current] || {};

		Object.assign(transition, transitionOptions, sliderOptions);

		if (transition.direction === undefined) {
			let direction = 'right';

			if (this.vm.Images.current.index > this.vm.Images.next.index)
				direction = 'left';

			transition.direction = direction;
		}
	}

	start(transition) {
		let vm = this.vm;

		vm.$emit('VueFlux-TransitionStart', vm, transition);

		let timeout = 0;

		if (transition !== undefined)
			timeout = vm.$refs.transition.totalDuration;

		vm.Timers.set('transition', timeout, () => {
			this.end(transition);
		});
	}

	end(transition) {
		let vm = this.vm;

		let currentImage = vm.imaman.current();
		let nextImage = vm.imaman.next();

		currentImage.setCss({ zIndex: 10 });
		nextImage.setCss({ zIndex: 11 });

		this.current = undefined;

		vm.$nextTick(() => {
			if (vm.config.infinite === false && nextImage.index === vm.imaman.count - 1) {
				vm.stop();
				return;
			}

			if (vm.config.autoplay === true) {
				vm.Timers.set('image', vm.config.delay, () => {
					vm.showImage('next');
				});
			}

			vm.$emit('VueFlux-TransitionEnd', vm, transition);
		});
	}

}