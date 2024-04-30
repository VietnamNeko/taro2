function move(canvas, camera, renderer, position, callback, endCallback) {
	let active = false;
	const pivotScene = new THREE.Group();
	const material1 = new THREE.MeshBasicMaterial({ color: getColor('color1') });
	const material2 = new THREE.MeshBasicMaterial({ color: getColor('color2') });
	const material3 = new THREE.MeshBasicMaterial({ color: getColor('color3') });

	const material4 = new THREE.MeshBasicMaterial({ color: getColor('hover') });

	const x = parse(gizmoObject('move_helper'));
	const y = x.clone();
	const z = x.clone();

	// x.children[0].geometry.translate(0,0,-1)
	const xz = parse(gizmoObject('generic_two_axis_helper'));

	xz.children[0].translateX(2);
	xz.children[0].translateZ(-1.5);

	xz.children[0].scale.set(3, 3, 3);

	const xy = xz.clone();
	const yz = xz.clone();

	xy.rotation.x = -Math.PI / 2;
	yz.rotation.z = Math.PI / 2;

	pivotScene.add(xz);
	pivotScene.add(xy);
	pivotScene.add(yz);
	pivotScene.add(y);
	pivotScene.add(z);
	pivotScene.add(x);

	y.rotation.x = Math.PI / 2;
	z.rotation.y = Math.PI;
	x.rotation.y = -Math.PI / 2;

	function resetMaterial() {
		setMaterial(x, material1);
		setMaterial(y, material2);
		setMaterial(z, material3);
		setMaterial(xz, material1);
		setMaterial(xy, material2);
		setMaterial(yz, material3);
		canvas.style.cursor = 'default';
	}
	resetMaterial();

	let drag = false;
	let selectedAxis = null;
	let selected = null;
	let previousDiff = null;
	let isHover = false;

	function move(point, axis) {
		position[axis] = point[axis];
	}
	function scaleGizmoObject(gizmoObject) {
		// Calculate the distance between the camera and the gizmoObject
		const distance = camera.position.distanceTo(position) / 80;
		// Set the scale of the gizmoObject based on distance
		gizmoObject.scale.set(distance, distance, distance);
	}
	function scale() {
		x.position.copy(position);
		y.position.copy(position);
		z.position.copy(position);
		xz.position.copy(position);
		xy.position.copy(position);
		yz.position.copy(position);
		scaleGizmoObject(x);
		scaleGizmoObject(y);
		scaleGizmoObject(z);
		scaleGizmoObject(xz);
		scaleGizmoObject(xy);
		scaleGizmoObject(yz);
	}

	document.addEventListener('mouseup', (e) => {
		if (!active) return;
		if (e.button != 0) return;
		if (drag) {
			endCallback(position);
		}
		drag = false;
		selectedAxis = null;
	});

	const caster = mouseRay(canvas, camera);

	document.addEventListener(
		'mousedown',
		(e) => {
			if (!active) return;
			if (e.button != 0 || e.ctrlKey) return;
			if (selectedAxis) {
				const ray = caster.cast(e);
				drag = true;
				const point = ray.snap(selectedAxis, position);
				previousDiff = {};
				for (const axis of selectedAxis) {
					previousDiff[axis] = position[axis] - point[axis];
				}
			}
		},
		true
	);

	document.addEventListener('mousemove', (e) => {
		if (!active) return;
		if (e.button != 0 || e.ctrlKey) {
			resetMaterial();
			return;
		}

		if (drag) {
			canvas.style.cursor = 'grabbing';

			const ray = caster.cast(e);
			const point = ray.snap(selectedAxis, position);
			for (const axis of selectedAxis) {
				point[axis] += previousDiff[axis];
				move(point, axis);
			}

			callback(position);
		} else {
			const ray = caster.cast(e, [x, y, z, xz, xy, yz]);
			resetMaterial();
			selectedAxis = null;
			isHover = false;
			if (ray.intersect != null) {
				isHover = true;
				if (objectContains(x, ray.intersect.object)) {
					selected = x;
					selectedAxis = 'x';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
				if (objectContains(y, ray.intersect.object)) {
					selected = y;
					selectedAxis = 'y';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
				if (objectContains(z, ray.intersect.object)) {
					selected = z;
					selectedAxis = 'z';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
				if (objectContains(xz, ray.intersect.object)) {
					selected = xz;
					selectedAxis = 'xz';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
				if (objectContains(xy, ray.intersect.object)) {
					selected = xy;
					selectedAxis = 'xy';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
				if (objectContains(yz, ray.intersect.object)) {
					selected = yz;
					selectedAxis = 'yz';
					setMaterial(ray.intersect.object, material4);
					canvas.style.cursor = 'grab';
				}
			}
		}
	});

	function render() {
		if (!active) return;
		scale();
		renderer.clearDepth();
		(taro.renderer as any).scene.add(pivotScene);
	}
	function set(x, y, z) {
		position.x = x;
		position.y = y;
		position.z = z;
		callback(position);
	}
	return {
		render,
		set active(value) {
			active = value;
		},
		set,
		get isHover() {
			return isHover;
		},
	};
}
