import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import GUI from '../threejs/examples/jsm/libs/lil-gui.module.min.js';

import * as CANNON from "../cannonjs/cannon-es.js";
import CannonDebugger from "../cannonjs/cannon-es-debugger.js";

let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;

// helpers to debug
let axesHelper;
let controls;
let gui;

// show and move cube
let cube;
let keyboard = {};

// camera follow player
let enableFollow;

// cannon variables
let world;
let cannonDebugger;
let timeStep = 1 / 60;

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
  controls.enablePan = false
  controls.dampingFactor = 0.2
  controls.minDistance = 10
  controls.maxDistance = 500
  controls.enabled = true

	elThreejs.appendChild(renderer.domElement);

  initCannon();
  addCubePhysics();

  addBox();
  addPlane();
  addObstacle();

  addKeysListener();
	addGUI();

  animate()
}

function animate(){
	renderer.render(scene, camera);

  movePlayer();

  if (enableFollow) followPlayer();

  world.step(timeStep);
	cannonDebugger.update();

	requestAnimationFrame(animate);

}

function addCubePhysics(){
  let cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  let cubeBody = new CANNON.Body({ mass: 1 });
  cubeBody.addShape(cubeShape);
  cubeBody.position.set(0, 2, 0);
  world.addBody(cubeBody);
}

function addBox(){
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshBasicMaterial({color: 'pink'});
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.5, 0);
  console.log(cube, "cube");
  scene.add(cube);
}

function addPlane(){
  let geometry =  new THREE.BoxGeometry(20, 0, 200);
  let material = new THREE.MeshBasicMaterial({color: 'gray'});
  let plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, -90);
  scene.add(plane);
}

function addObstacle(){
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshBasicMaterial({color: 'red'});
  let obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.set(0, 0.5, -10);
  scene.add(obstacle);
}


function addKeysListener(){
  window.addEventListener('keydown', function(event){
    keyboard[event.keyCode] = true;
  } , false);
  window.addEventListener('keyup', function(event){
    keyboard[event.keyCode] = false;
  } , false);
}

function movePlayer(){

  // up letter W
  // if(keyboard[87]) cube.position.z -= 0.1
  if(keyboard[87]) cube.translateZ(-0.1);

  // down letter S
  if(keyboard[83]) cube.translateZ(+0.1);

  // left letter A
  // if(keyboard[65]) cube.rotation.y += 0.01;
  if(keyboard[65]) cube.rotateY(0.01);

  // right letter D
  if(keyboard[68]) cube.rotateY(-0.01);

}


function followPlayer(){
  camera.position.x = cube.position.x;
  camera.position.y = cube.position.y + 1;
  camera.position.z = cube.position.z + 5;
}


function addGUI(){
  gui = new GUI();

  const options = {
		orbitsControls: true
	}

  gui.add(options, 'orbitsControls').onChange( value => {
		if (value){
			controls.enabled = true;
			enableFollow = false;
		}else{
			controls.enabled = false;
			enableFollow = true;
		}
	});

}

function initCannon() {
	// Setup world
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

function initCannonDebugger(){
  cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
			// Toggle visibiliy on "d" press
			document.addEventListener("keydown", (event) => {
				if (event.key === "f") {
					mesh.visible = !mesh.visible;
				}
			});
		},
	});
}