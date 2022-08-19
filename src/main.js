import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';

let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;
let axesHelper;
let controls;

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
  camera.position.z = 5;
  camera.position.y = 1;


  // render
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;


  // axesHelper
	axesHelper = new THREE.AxesHelper( 100 );
	scene.add( axesHelper );

  // orbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.enableDamping = true
  controls.enablePan = false
  controls.dampingFactor = 0.2
  controls.minDistance = 10
  controls.maxDistance = 500
  controls.enabled = true

    

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
