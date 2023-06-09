import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/addons/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Load the 3D model
const loader = new THREE.GLTFLoader();
loader.load('model.gltf', function (gltf) {
  const model = gltf.scene;
  scene.add(model);
});

// Create an animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

// Start the animation loop
animate();
