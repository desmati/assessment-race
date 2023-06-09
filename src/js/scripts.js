import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import * as YUKA from 'yuka';
import playAudio from './play-audio';


// 3D effects:
let initedEffects = false;
var noise = new SimplexNoise();
let meshRoof, meshFloor, ball, group;
const audioFile = './assets/audio.mp3';
let analyser;
let isPlaying = false;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();


const scoreP = 999;
const scorePD = 1500;
let scorePass = scoreP;
let isFinished = false;

let isPaused = false;

let box, textFinished, textGotP, textOffHands, textPaused, fontFamily;

const textureLoader = new THREE.TextureLoader();
const obstacles = {
    list: [
        textureLoader.load('./assets/assessor-0.png'),
        textureLoader.load('./assets/assessor-1.png'),
        textureLoader.load('./assets/assessor-2.png'),
        textureLoader.load('./assets/assessor-3.png'),
        textureLoader.load('./assets/assessor-4.png')
    ],
    getRandom: () => obstacles.list[getRandomInt(0, obstacles.list.length - 1)]
}

// Define global variables
let container, scene, camera, renderer, controls, vehicle;
let keyboard = {};
let clock = new THREE.Clock();

let x_velocity = 300;
let z_velocity = 10;

const entityManager = new YUKA.EntityManager();

let movingCube;
let collideMeshList = [];
let cubes = [];
let crash = false;
let score = 0;
let scoreText = document.getElementById("score");
let id = 0;
let crashId = " ";
let lastCrashId = " ";

// init3dGame();

// initPassedMessage();

initStartPage();

// initInstructions();

function initStartPage() {
    document.getElementById("welcome-container").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("instructions-container").style.display = "none";
    document.getElementById("canvas1-win").style.display = "none";

    let tl = gsap.timeline();
    tl.set(".welcome-container", { scale: 0.1 })
        .to(".welcome-container", { scale: 1, duration: 3 })
        .from("h1", {
            opacity: 0,
            duration: 1.5,
        })
        .from(".demo div", { y: 80, opacity: 0, stagger: 0.5 })
        .to(".demo div", {
            opacity: 0.85,
            stagger: {
                each: 0.1,
                start: "random",
            },
        })
        .to(".demo div", {
            opacity: 0.85,
            stagger: {
                each: 0.5,
                start: "random",
            },

            x: function (index, target) {
                var itemWidth = target.offsetWidth;
                var containerWidth = window.innerWidth;
                var padding = 20;

                var startPosition =
                    containerWidth / 2.5 -
                    (itemWidth + padding) *
                    Math.floor(
                        gsap.utils.wrap(
                            0,
                            containerWidth / (itemWidth + padding) - 1,
                            index
                        )
                    );

                return startPosition + Math.random() * padding;
            },
            rotation: 360,
            color: "#02FF86",
        })
        .to(".demo div", {
            scale: 0,
            stagger: { start: "end", each: 1, opacity: 0 },
        })
        .from(
            ".button-groups a",
            {
                ease: "Bounce.easeIn",
                opacity: 0,
                duration: 3,
                scale: 0,
            },
            "-=2"
        )

    document.getElementById("enter-start").addEventListener('click', () => {
        document.getElementById("welcome-container").style.display = "none";
        document.getElementById("game-container").style.display = "none";
        document.getElementById("instructions-container").style.display = "block";
        document.getElementById("canvas1-win").style.display = "none";
        initInstructions();
    });
}

function initInstructions() {

    document.getElementById("instructions-start-game").addEventListener('click', () => {
        document.getElementById("welcome-container").style.display = "none";
        document.getElementById("game-container").style.display = "block";
        document.getElementById("instructions-container").style.display = "none";
        document.getElementById("canvas1-win").style.display = "none";

        setTimeout(() => {
            init3dGame();
        }, 200);
    });

    gsap.registerPlugin(ScrollTrigger);
    let tl = gsap.timeline();
    tl.fromTo(
        "#instructions-container .content",
        { yPercent: 10, scale: 0.2 },
        {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            scrollTrigger: {
                trigger: ".second",
                start: "top center",
                end: "center 50%",

                scrub: true,
            },
        }
    )
        .fromTo(
            "#instructions-container .amin",
            { xPercent: -100, scale: 0.6, opacity: 0 },
            {
                opacity: 1,
                xPercent: 0,
                scale: 1,
                scrollTrigger: {
                    trigger: ".third ",
                    start: "top center",
                    end: "center 50%",

                    scrub: true,
                },
            }
        )
        .fromTo(
            "#instructions-container .amin2",
            { xPercent: 100, scale: 0.2, opacity: 0, duration: 1 },
            {
                opacity: 1,
                xPercent: 0,
                scale: 1,
                scrollTrigger: {
                    trigger: ".fourth ",
                    start: "top bottom",
                    end: "center 50%",

                    scrub: true,
                },
            }
        );

    //
    gsap.utils.toArray("#instructions-container .layer").forEach((layer, i) => {
        ScrollTrigger.create({
            trigger: layer,
            start: "top top",
            pin: true,
            pinSpacing: false,
        });
    });
    //

    // Create a new timeline
    const tl2 = gsap.timeline();
    const group = document.querySelectorAll("#Aria, #Amin ,#Regan,#Ila,#Hossein");

    tl2
        .set(group, { opacity: 0, scale: 0 })
        .to(group, {
            stagger: {
                each: 0.6,
            },
            scale: 1,
            opacity: 1,
        })
        .fromTo('.first h2', {

            scale: 0.5,
            opacity: 0
        }, {
            x: 50,
            y: -150,
            scale: 1,
            duration: 3,
            opacity: 1
        })




}

function init3dGame() {

    // Event listeners
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


    init();
    animate();



}




function init() {
    const fontLoader = new FontLoader();
    fontLoader.load('./assets/font.json', function (font) {
        // Use the loaded font in your code
        fontFamily = font;

        initDialog();
        initWinDialog();
        initPausedDialog();
    });


    // Scene
    scene = new THREE.Scene();
    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 0.5, 20000);
    camera.position.set(0, 170, 400);
    camera.lookAt(scene.position);

    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(screenWidth, screenHeight);
    // renderer.setClearColor(0xA3A3A3);

    container = document.getElementById("scene");
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);



    // Add Car
    vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = 3; // Adjust the maximum speed of the vehicle as desired
    vehicle.turnSpeed = 1; // Adjust the turn speed of the vehicle as desired

    entityManager.add(vehicle);

    const loader = new GLTFLoader();
    loader.load('./assets/SUV.glb', function (glb) {
        const model = glb.scene;
        model.traverse(child => {
            if (child.isMesh) {
                let scale = 25; // Adjust the scale to match the YUKA vehicle scale
                child.scale.set(scale, scale, scale);
            }
        });

        scene.add(model);
        model.matrixAutoUpdate = false;
        vehicle.scale = new YUKA.Vector3(1, 1, 1); // Set the scale to (1, 1, 1) to match the GLTF model scale
        vehicle.setRenderComponent(model, sync);
    });

    const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
    vehicleGeometry.rotateX(Math.PI * 0.5);
    const vehicleMaterial = new THREE.MeshNormalMaterial();
    const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
    vehicleMesh.matrixAutoUpdate = false;
    scene.add(vehicleMesh);


    // Add two lines
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([-250, -1, -3000, -300, -1, 200], 3)
    );
    let material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        linewidth: 100,
        fog: true,
    });
    let line1 = new THREE.Line(geometry, material);
    scene.add(line1);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([250, -1, -3000, 300, -1, 200], 3)
    );
    let line2 = new THREE.Line(geometry, material);
    scene.add(line2);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, -1, -3000, 0, -1, 200], 3)
    );

    let material3 = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1,
    });
    let line3 = new THREE.Line(geometry, material3);
    scene.add(line3);

    // Add the control cube
    let cubeGeometry = new THREE.BoxGeometry(50, 25, 60, 5, 5, 5);
    let wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    });

    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    movingCube.visible = false;
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);

    initEffects();

    // Event listeners
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
}

function animate() {
    requestAnimationFrame(animate);
    entityManager.update(0);
    update();
    renderer.render(scene, camera);
}

function update() {
    if (isPaused) {
        return; // Exit the function without updating the movement
    }

    x_velocity += 0.1;
    z_velocity += 0.01;

    var delta = clock.getDelta();
    var moveDistance = x_velocity * delta;
    var rotateAngle = Math.PI / 2 * delta;

    if (keyboard["ArrowLeft"] || keyboard["KeyA"]) {
        if (movingCube.position.x > -270) {
            movingCube.position.x -= moveDistance;
            vehicle.position.x -= moveDistance;
            entityManager.update(0)
        }

        if (camera.position.x > -150) {
            camera.position.x -= moveDistance * 0.6;
            if (camera.rotation.z > -5 * Math.PI / 180) {
                camera.rotation.z -= 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard["ArrowRight"] || keyboard["KeyD"]) {
        if (movingCube.position.x < 270) {
            movingCube.position.x += moveDistance;
            vehicle.position.x += moveDistance;
            entityManager.update(0);
        }
        if (camera.position.x < 150) {
            camera.position.x += moveDistance * 0.6;
            if (camera.rotation.z < 5 * Math.PI / 180) {
                camera.rotation.z += 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard["ArrowUp"] || keyboard["KeyW"]) {
        z_velocity += 0.1;
        z_velocity = Math.max(z_velocity, 10);

        movingCube.position.z -= moveDistance;
        vehicle.position.z -= moveDistance;
        entityManager.update(0);
    }
    if (keyboard["ArrowDown"] || keyboard["KeyS"]) {
        z_velocity -= 0.3;
        z_velocity = Math.max(z_velocity, 10);

        movingCube.position.z += moveDistance;
        vehicle.position.z += moveDistance;
        entityManager.update(0);
    }

    if (!(keyboard["ArrowLeft"] || keyboard["ArrowRight"] || keyboard["KeyA"] || keyboard["KeyD"])) {
        delta = camera.rotation.z;
        if (delta > 0) {
            camera.rotation.z -= Math.min(delta, rotateAngle);
        } else if (delta < 0) {
            camera.rotation.z -= Math.max(delta, -rotateAngle);
        }
    }

    // Collision detection
    var originPoint = movingCube.position.clone();
    var vertices = movingCube.geometry.attributes.position;

    for (let vertexIndex = 0; vertexIndex < vertices.count; vertexIndex += 3) {
        const localVertex = new THREE.Vector3();
        localVertex.fromBufferAttribute(vertices, vertexIndex);
        const globalVertex = localVertex.applyMatrix4(movingCube.matrixWorld);
        const directionVector = globalVertex.sub(movingCube.position);

        const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        const collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;

            score -= 100;

            crashed();

            break;
        }

        crash = false;
        score += 0.005;

    }

    // Cube generation
    if (id % 30 == 0) {
        var randomInt = getRandomInt(-200, 200);

        var planeGeometry = new THREE.PlaneGeometry(50, 100);
        var planeMaterial = new THREE.MeshBasicMaterial({ map: obstacles.getRandom() });

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(randomInt, 25, -3000);
        plane.name = id.toString();

        cubes.push(plane);
        scene.add(plane);
        collideMeshList.push(plane);
    }


    // Move cubes
    for (var i = 0; i < cubes.length; i++) {
        cubes[i].position.z += z_velocity;
        if (cubes[i].position.z > 300) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
            i--;
        }
    }

    // Reset crash
    if (crash) {
        crash = false;
    }

    id++;

    // Update the score text
    let scoreDisplay = Math.min(100, Math.ceil(score * 100 / scorePass));
    scoreText.innerText = `Assessment: ${scoreDisplay}%`;

    isFinished = score >= scorePD;

    if (score >= scorePass && !isPaused) {
        isPaused = true;
        displayWinDialogBox();
    }

}

// Keyboard events
function onDocumentKeyDown(event) {

    if (isFinished) {
        return;
    }

    startAudioPlayback();

    keyboard[event.code] = true;

    if (event.code === "KeyP" || event.code === "Escape") {
        isPaused = !isPaused;
        if (isPaused) {
            displayPauseDialogBox();
        } else {
            hideDialogs();
        }
    }

    if (event.code === "KeyC" && isPaused && score >= scorePass) {
        isPaused = false;
        scorePass = scorePD;
        hideDialogs();
    }
}

function onDocumentKeyUp(event) {
    keyboard[event.code] = false;
}

// Helper function to get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

function crashed() {
    playAudio('./assets/explode.mp3');
}

function initDialog() {
    // Create a background plane for the dialog box
    const boxGeometry = new THREE.BoxGeometry(300, 100, 10);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 50, 100); // Adjust the position of the dialog box
    box.visible = false;

    scene.add(box);
}

function initWinDialog() {
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Create text to display inside the dialog box
    const textGotPGeometry = new TextGeometry(
        `   You passed the assessment!\r\nPress C if you want to go for a PD.`,
        {
            font: fontFamily,
            size: 10,
            height: 3
        });


    textGotP = new THREE.Mesh(textGotPGeometry, textMaterial);
    textGotP.position.set(-130, 70, 120); // Adjust the position of the text
    textGotP.visible = false;
    scene.add(textGotP);

    // Create text to display inside the dialog box
    const textOffHandsGeometry = new TextGeometry(
        `You have some PD stuff!\r\nBut you got a NP for no reason!\r\nDon't argue, it is off my hands!`,
        {
            font: fontFamily,
            size: 10,
            height: 2
        });


    textOffHands = new THREE.Mesh(textOffHandsGeometry, textMaterial);
    textOffHands.position.set(-120, 80, 120); // Adjust the position of the text
    textOffHands.visible = false;
    scene.add(textOffHands);

    // Create text to display inside the dialog box
    const textFinishedGeometry = new TextGeometry(
        `Well done! You did it!`,
        {
            font: fontFamily,
            size: 10,
            height: 3
        });


    textFinished = new THREE.Mesh(textFinishedGeometry, textMaterial);
    textFinished.position.set(-80, 80, 120); // Adjust the position of the text
    textFinished.visible = false;
    scene.add(textFinished);

}

function initPausedDialog() {
    // Create text to display inside the dialog box
    const textGeometry = new TextGeometry("Press ESC to continue", {
        font: fontFamily,
        size: 10,
        height: 1
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    textPaused = new THREE.Mesh(textGeometry, textMaterial);
    textPaused.position.set(-80, 55, 120); // Adjust the position of the text
    scene.add(textPaused);

    // Hide the text initially
    textPaused.visible = false;

}

function displayWinDialogBox() {
    hideDialogs();

    // Show the dialog box and text
    setTimeout(() => {
        box.visible = true;

        if (isFinished) {
            textFinished.visible = true;
            return;
        }

        const passProbability = 2;
        const noPassProbability = 1;

        const totalProbability = passProbability + noPassProbability;
        const threshold = Math.random() * totalProbability;

        if (threshold < passProbability) {
            isFinished = true;
            textOffHands.visible = true;
        } else {
            textGotP.visible = true;
            initPassedMessage();

        }

    }, 100);
}

function displayPauseDialogBox() {
    hideDialogs();

    setTimeout(() => {
        // Show the dialog box and text
        box.visible = true;

        textPaused.visible = true;
    }, 100);
}

function hideDialogs() {
    box.visible = false;
    textGotP.visible = false;
    textOffHands.visible = false;
    textPaused.visible = false;
    textFinished.visible = false;
}

//#region Effect

function initEffects() {
    if (initedEffects) {
        return;
    }

    initedEffects = true;

    //here comes the webgl
    group = new THREE.Group();

    const w = innerWidth, h = innerHeight;
    var meshGeometry = new THREE.PlaneBufferGeometry(w, h, 20, 20);
    var meshMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        wireframe: true
    });

    meshRoof = new THREE.Mesh(meshGeometry, meshMaterial);
    meshRoof.rotation.x = -0.5 * Math.PI;
    meshRoof.position.set(0, innerHeight / 2 - 500, innerHeight / 2);
    group.add(meshRoof);

    meshFloor = new THREE.Mesh(meshGeometry, meshMaterial);
    meshFloor.rotation.x = -0.5 * Math.PI;
    meshFloor.position.set(0, -innerHeight / 2 + 500, 0);
    meshFloor.visible = false;
    group.add(meshFloor);

    var icosahedronGeometry = new THREE.IcosahedronGeometry(2, 1);
    var lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    ball.visible = false;
    group.add(ball);


    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(ball);
    spotLight.castShadow = true;
    scene.add(spotLight);

    scene.add(group);
}



function render3d(dataArray) {
    if (!dataArray) {
        return;
    }


    var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
    var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

    var overallAvg = avg(dataArray);
    var lowerMax = max(lowerHalfArray);
    var lowerAvg = avg(lowerHalfArray);
    var upperMax = max(upperHalfArray);
    var upperAvg = avg(upperHalfArray);

    var lowerMaxFr = lowerMax / lowerHalfArray.length;
    var lowerAvgFr = lowerAvg / lowerHalfArray.length;
    var upperMaxFr = upperMax / upperHalfArray.length;
    var upperAvgFr = upperAvg / upperHalfArray.length;

    makeRoughGround(meshRoof, modulate(upperAvgFr, 0, 1, 0.5, 4));
    // makeRoughGround(meshFloor, modulate(lowerMaxFr, 0, 1, 0.5, 4), randomColor);

    //makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4), randomColor);

    // group.rotation.y += 0.005;
    renderer.render(scene, camera);
}

function makeRoughGround(mesh, distortionFr) {
    var vertices = mesh.geometry.attributes.position;
    var vertex = new THREE.Vector3(); // Create the vertex object outside the loop for efficiency
    var time = Date.now();
    var amp = 10;

    for (let vertexIndex = 0; vertexIndex < vertices.count; vertexIndex++) {
        vertex.fromBufferAttribute(vertices, vertexIndex);

        var distance = (noise.noise3D(vertex.x + time * 0.0003, vertex.y + time * 0.0001, vertex.z) + 0) * distortionFr * amp;
        vertex.z = distance;

        vertices.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
    }

    // mesh.material.color.set(randomColor);

    vertices.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
}



// function makeRoughBall(mesh, bassFr, treFr, randomColor) {
//     mesh.geometry.vertices.forEach(function (vertex, i) {
//         var offset = mesh.geometry.parameters.radius;
//         var amp = 10;
//         var time = window.performance.now();
//         vertex.normalize();
//         var rf = 0.00001;
//         var distance = (offset + bassFr) + noise.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
//         vertex.multiplyScalar(distance);
//     });

//     mesh.material.color.set(randomColor); // Set the color of the mesh material

//     mesh.geometry.verticesNeedUpdate = true;
//     mesh.geometry.normalsNeedUpdate = true;
//     mesh.geometry.computeVertexNormals();
//     mesh.geometry.computeFaceNormals();
// }


//#endregion



//#region Audio

async function loadAudio(url, progressCallback) {

    const response = await fetch(url);
    const contentLength = response.headers.get('content-length');
    const totalBytes = parseInt(contentLength, 10);
    let loadedBytes = 0;

    const reader = response.body.getReader();

    const chunks = [];
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedBytes += value.length;

        // Calculate the loading progress
        const progress = Math.min(100, Math.ceil(receivedBytes / totalBytes * 100));

        // Invoke the progress callback with the current progress value
        if (progressCallback) {
            progressCallback(progress);
        }
    }

    const allChunks = new Uint8Array(receivedBytes);
    let position = 0;

    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }

    const audioBuffer = await audioContext.decodeAudioData(allChunks.buffer);
    return audioBuffer;
}


//#endregion

//#region Helpers

//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr) {
    var total = arr.reduce(function (sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr) {
    return arr.reduce(function (a, b) { return Math.max(a, b); })
}

// Helper function to generate random numbers within a range
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function toHexColor(floatNumber) {
    var normalizedNumber = (Math.abs(floatNumber) + 1) / 2; // Normalize to the range 0-1

    var maxHexValue = 0xFFFFFF; // Maximum value of a hexadecimal color
    var hexColor = Math.floor(normalizedNumber * maxHexValue);

    return hexColor;
}


//#endregion


//#region " Visualize "

// Define a function to update the rotation based on the audio data
function updateEffects() {
    // Get the audio data from the analyser
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    render3d(dataArray);

    // Calculate the average frequency
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const averageFrequency = sum / bufferLength;

    // Call the updateEffects function on the next animation frame
    requestAnimationFrame(updateEffects);


}

// Function to handle button click and start audio playback
async function startAudioPlayback() {
    if (isPlaying) {
        return;
    }
    isPlaying = true;

    const buffer = await loadAudio(audioFile, (progress) => {
        // let p = document.getElementById("progress");

        // if (!p) {
        //     return;
        // }

        // if (progress >= 100) {
        //     p.remove();
        //     return;
        // }
        // p.style.width = `${progress}vw`;

    });



    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Create an analyser node
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    // Connect the source to the analyser
    source.connect(analyser);

    // Connect the analyser to the audio context destination
    analyser.connect(audioContext.destination);

    source.start();

    initEffects();

    // Call the updateEffects function to start updating the rotation
    updateEffects();

}


//#endregion




function initPassedMessage() {

    document.getElementById("canvas1-win").style.display = "block";
    document.getElementById("welcome-container").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("instructions-container").style.display = "none";

    const canvas = document.getElementById("canvas1-win");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(effect, x, y, color) {
            this.effect = effect;
            this.x = Math.random() * this.effect.canvasWidth;
            this.y = this.effect.canvasHeight;
            this.color = color;
            this.originX = x;
            this.originY = y;
            this.size = this.effect.gap;
            this.dx = 0;
            this.dy = 0;
            this.vx = 0;
            this.vy = 0;
            this.force = 0;
            this.angle = 0;
            this.distance = 0;
            this.friction = Math.random() * 0.6 + 0.15;
            this.ease = Math.random() * 0.1 + 0.005;
        }
        draw() {
            this.effect.context.fillStyle = this.color;
            this.effect.context.fillRect(this.x, this.y, this.size, this.size);
        }
        update() {
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;
            this.force = -this.effect.mouse.radius / this.distance;
            if (this.distance < this.effect.mouse.radius) {
                this.angle = Math.atan2(this.dy, this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }

            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        }
    }

    class Effect {
        constructor(context, canvasWidth, canvasHeight) {
            this.context = context;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;
            this.fontSize = 130;
            this.lineHeight = this.fontSize * 0.9;
            this.maxTextWidth = this.canvasWidth * 0.4;
            //particles text
            this.particles = [];
            this.gap = 3;
            this.mouse = {
                radius: 20000,
                x: 0,
                y: 0,
            };
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
        }
        wrapText(text) {
            //canvas setting
            const gradient = this.context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
            gradient.addColorStop(0.3, "red");
            gradient.addColorStop(0.5, "orange");
            gradient.addColorStop(0.7, "yellow");
            this.context.fillStyle = gradient;
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.strokeStyle = "white";
            this.context.letterSpacing = "5px";
            this.context.lineWidth = 3;
            this.context.font = this.fontSize + "px Impact";

            //break multiple text
            let linesArray = [];
            let words = text.split(" ");
            let lineCounter = 0;
            let line = " ";
            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + " ";
                if (this.context.measureText(testLine).width > this.maxTextWidth) {
                    line = words[i] + " ";
                    lineCounter++;
                } else {
                    line = testLine;
                }
                linesArray[lineCounter] = line;
            }
            let textHeight = this.lineHeight * lineCounter;
            this.textY = this.canvasHeight / 2 - textHeight / 2;
            linesArray.forEach((el, index) => {
                this.context.fillText(el, this.textX, this.textY + index * this.lineHeight);
                this.context.strokeText(el, this.textX, this.textY + index * this.lineHeight);
            });
            this.convertToParticles();
        }

        convertToParticles() {
            this.particles = [];
            const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            for (let y = 0; y < this.canvasHeight; y += this.gap) {
                for (let x = 0; x < this.canvasWidth; x += this.gap) {
                    const index = (y * this.canvasWidth + x) * 4;
                    const alpha = pixels[index + 3];
                    if (alpha > 0) {
                        const red = pixels[index];
                        const green = pixels[index + 1];
                        const blue = pixels[index + 2];
                        const color = "rgb(" + red + "," + green + "," + blue + ")";
                        this.particles.push(new Particle(this, x, y, color));
                    }
                }
            }
        }
        render() {
            this.particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });
        }
        resize(width, height) {
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;
            this.maxTextWidth = this.canvasWidth * 0.4;
        }
    }

    const effect = new Effect(ctx, canvas.width, canvas.height);
    effect.wrapText("You passed! Congrats!");
    effect.render();
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.render();
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        effect.resize(canvas.width, canvas.height);
        effect.wrapText("You passed! Congrats!");
        console.log("resize");
    });
}