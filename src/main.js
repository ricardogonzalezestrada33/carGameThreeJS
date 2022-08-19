import * as THREE from "../threejs/build/three.module.js";



let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;


init();

function init() {

  // Scene
	scene = new THREE.Scene();

  // Camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
  console.log(camera,"camera");
  camera.position.z = 5;
  camera.position.y = 1;


  // render
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;

	elThreejs.appendChild(renderer.domElement);

  addBox();
  animate()
}

function animate(){
	renderer.render(scene, camera);

	requestAnimationFrame(animate);

}

function addBox(){
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshBasicMaterial({color: 'pink'});
  let cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}
