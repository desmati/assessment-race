
const score = document.querySelector('.Score');
const startscreen = document.querySelector('.StartScreen');
const gamearea = document.querySelector('.GameArea');
let player = { speed: 1, score: 0 };
let highest = 0;
let keys = { ArrowUp: false, ArrowDown: false, ArrowRight: false, ArrowLeft: false };
let speedInterval = null;

startscreen.addEventListener('click', start);
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(ev) {
    ev.preventDefault();
    keys[ev.key] = true;

}

function keyUp(ev) {
    ev.preventDefault();
    keys[ev.key] = false;

}

function isCollide(a, b) {
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();

    return !((aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right));
}

function moveLines() {
    let lines = document.querySelectorAll('.lines');
    lines.forEach(function (item) {
        if (item.y >= 700) {
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.top = item.y + 'px';

    })
}

function endGame() {
    player.start = false;
    startscreen.classList.remove('hide');
    stopRecognition();
}

function moveCar(car) {
    let other = document.querySelectorAll('.other');
    other.forEach(function (item) {
        if (isCollide(car, item)) {
            console.log('HIT');
            endGame();
        }

        // item.setAttribute('class', '');
        // item.classList.add("other");
        // item.classList.add("other-" + Math.floor(Math.random() * 3));

        if (item.y >= 750) {
            item.y = -750;
            item.style.left = randomLeft() + 'px';
        }
        item.y += player.speed;
        item.style.top = item.y + 'px';

    })
}

function gamePlay() {

    let car = document.querySelector('.car');
    let road = gamearea.getBoundingClientRect();

    if (player.start) {

        moveLines();
        moveCar(car);
        if (keys.ArrowUp && player.y > (road.top + 70)) {
            player.y -= player.speed;
        }
        if (keys.ArrowDown && player.y < (road.bottom - 70)) {
            player.y += player.speed;
        }
        if (leftDetected) {
            player.x = 75;
            leftDetected = false;
            rightDetected = false;
        }

        if (rightDetected) {
            player.x = 275;
            leftDetected = false;
            rightDetected = false;
        }

        if (keys.ArrowLeft && player.x > 0) {
            player.x = 75;
        }

        if (keys.ArrowRight && player.x < (road.width - 50)) {
            player.x = 275;
        }

        car.style.top = player.y + 'px';
        car.style.left = player.x + 'px';

        window.requestAnimationFrame(gamePlay);
        //console.log(player.score++);
        player.score++;
        if (player.score >= highest) {
            highest = player.score;
        }
        score.innerHTML = "Your Score:" + player.score + "<br><br>" + "Highest Score:" + highest;


    }

}

function Reset() {
    highest = 0;
}

function start() {
    //gamearea.classList.remove('hide');
    startscreen.classList.add('hide');
    gamearea.innerHTML = "";

    player.start = true;
    player.score = 0;
    window.requestAnimationFrame(gamePlay);



    for (x = 0; x < 5; x++) {
        let roadline = document.createElement('div');
        roadline.setAttribute('class', 'lines');
        roadline.y = (x * 150);
        roadline.style.top = roadline.y + 'px';
        gamearea.appendChild(roadline);
    }

    let car = document.createElement('div');
    car.setAttribute('class', 'car');
    gamearea.appendChild(car);

    player.x = 75;
    player.y = car.offsetTop;


    for (x = 0; x < 10; x++) {
        let othercar = document.createElement('div');
        othercar.setAttribute('class', 'other');
        othercar.classList.add("other-" + Math.floor(Math.random() * 3));
        othercar.y = ((x + 1) * 550) * -1;
        othercar.style.top = othercar.y + 'px';
        othercar.style.left = randomLeft() + 'px';
        console.log(othercar)
        gamearea.appendChild(othercar);
    }

    restartRecognition();

    if (speedInterval) {
        clearInterval(speedInterval);
    }

    speedInterval = setInterval(() => {
        player.speed++;
    }, 5000);
}

randomLeft = () => ([75, 275][Math.floor(Math.random() * 1000) % 2]);
randomTop = () => ([75, 275][Math.floor(Math.random() * 1000) % 2]);