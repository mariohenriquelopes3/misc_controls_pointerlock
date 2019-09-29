import * as THREE from '../build/three.module.js';

function MyRaycaster( controls, objects ) {
	var instancia = this;
	this.controls = controls;
	this.objects = objects;

	this.constAltura = 10;
	this.constLargura = 5;
	this.velocity = new THREE.Vector3();
	this.direction = new THREE.Vector3();
	this.deslocX = 0;
	this.deslocY = 0;
	this.deslocZ = 0;
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.canJump = false;
	
	this.rcx1Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 1, 0, 0));
	this.rcx2Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(-1, 0, 0));
	this.rcy1Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,  1, 0));
	this.rcy2Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
	this.rcz1Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0,  1));
	this.rcz2Infinity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1));

	this.onKeyDown = function(event) {
	    switch (event.keyCode) {
	        case 38: // up
	        case 87: // w
	            instancia.moveForward = true;
	            break;
	        case 37: // left
	        case 65: // a
	            instancia.moveLeft = true;
	            break;
	        case 40: // down
	        case 83: // s
	            instancia.moveBackward = true;
	            break;
	        case 39: // right
	        case 68: // d
	            instancia.moveRight = true;
	            break;
	        case 32: // space
	            if (instancia.canJump === true) instancia.velocity.y += 350;
	            instancia.canJump = false;
	            break;
	    }
	};

	this.onKeyUp = function(event) {
	    switch (event.keyCode) {
	        case 38: // up
	        case 87: // w
	            instancia.moveForward = false;
	            break;
	        case 37: // left
	        case 65: // a
	            instancia.moveLeft = false;
	            break;
	        case 40: // down
	        case 83: // s
	            instancia.moveBackward = false;
	            break;
	        case 39: // right
	        case 68: // d
	            instancia.moveRight = false;
	            break;
	    }
	};

	document.addEventListener( 'keydown', this.onKeyDown, false );
	document.addEventListener( 'keyup', this.onKeyUp, false );

	this.render = function (time, prevTime) {

		var delta = (time - prevTime) / 1000;

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;

		this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
		this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
		this.direction.normalize(); // this ensures consistent movements in all directions

		if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
		if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

		this.deslocX = this.controls.getObject().position.x;
		this.deslocY = this.controls.getObject().position.y;
		this.deslocZ = this.controls.getObject().position.z;

		this.controls.moveRight(-this.velocity.x * delta);
		this.controls.moveForward(-this.velocity.z * delta);

		this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

		this.deslocX = this.controls.getObject().position.x - this.deslocX;
		this.deslocY = this.controls.getObject().position.y - this.deslocY;
		this.deslocZ = this.controls.getObject().position.z - this.deslocZ;

		this.canJump = false;
		// RayCaster Y
		if (this.deslocY < 0) {
		    this.regraRayCast(Math.abs(this.deslocY), this.rcy2Infinity, this.controls, this.objects, this.velocity, 1, this.constAltura, 'y');
		} else {
		    this.regraRayCast(this.deslocY, this.rcy1Infinity, this.controls, this.objects, this.velocity, -1, this.constAltura, 'y');
		}

		// RayCaster X
		if (this.deslocX < 0) {
		    this.regraRayCast(Math.abs(this.deslocX), this.rcx2Infinity, this.controls, this.objects, this.velocity, 1, this.constLargura, 'x');
		} else {
		    this.regraRayCast(this.deslocX, this.rcx1Infinity, this.controls, this.objects, this.velocity, -1, this.constLargura, 'x');
		}

		// RayCaster Z
		if (this.deslocZ < 0) {
		    this.regraRayCast(Math.abs(this.deslocZ), this.rcz2Infinity, this.controls, this.objects, this.velocity, 1, this.constLargura, 'z');
		} else {
		    this.regraRayCast(this.deslocZ, this.rcz1Infinity, this.controls, this.objects, this.velocity, -1, this.constLargura, 'z');
		}

	};

	this.regraRayCast = function ( desloc, rc, controls, objects, velocity, vScale, padding, eixoAtr ) {
		var arrayObjInf1;
		var arrayObjInf2;
		var distance;
		
		rc.ray.origin.copy(controls.getObject().position);
		arrayObjInf2 = rc.intersectObjects(objects);

		
		rc.ray.origin[eixoAtr] += (desloc * vScale);
		arrayObjInf1 = rc.intersectObjects(objects);

		if (arrayObjInf1.length > 0 && !this.objetoCapturado(arrayObjInf2, arrayObjInf1[0].object) ) {
			distance = Math.abs(arrayObjInf1[0].distance);
			
			controls.getObject().position[eixoAtr] += (desloc * vScale);
			controls.getObject().position[eixoAtr] -= ((distance - padding) * vScale);
			if (eixoAtr == 'y') {
				this.velocity[eixoAtr] = 0;
				if (vScale == 1) {
					this.canJump = true;
				}
			}
			return true;
		}

		if (arrayObjInf2.length > 0) {
			distance = Math.abs(arrayObjInf2[0].distance);
			if (distance < padding) {
				controls.getObject().position[eixoAtr] += ((padding - distance) * vScale);
				if (eixoAtr == 'y') {
					this.velocity[eixoAtr] = 0;
					if (vScale == 1) {
						this.canJump = true;
					}
				}
				return true;
			}
		}

		return false;
	};

	this.objetoCapturado = function (lista, obj) {
		for (var i = 0; i < lista.length; i++) {
			if (lista[i].object === obj) {
				return true;
			}
		}
		return false;
	};
}

export { MyRaycaster };