const equationArea = document.getElementById("equation-area");
const input = document.getElementById("answer");
const gameOverText = document.getElementById("game-over");


let equations = [];
let speed = 0.2; // pixele na ms
let lastSpawnTime = 0;
const spawnInterval = 1500; // Co ile ms ma się respić kolejne równanie

let animationFrame;
let lastTime = 0;

function generateEquation() {
  const ops = ["+", "-", "*", "/"];
  let a = Math.floor(Math.random() * 12) + 1;
  let b = Math.floor(Math.random() * 12) + 1;
  let op = ops[Math.floor(Math.random() * ops.length)];

  if (op === "/") a = a * b; //Sprawdzam czy podzielne

  if (op === "-") {
    if (b > a) {
      [a, b] = [b, a]; //Upewniam się żeby wynik nie był ujemny
    }
  }

  return {
    text: `${a} ${op} ${b}`,
    result: Math.floor(eval(`${a} ${op} ${b}`))
  };
}

function spawnEquation() {
  const eq = generateEquation();
  const el = document.createElement("div");
  el.className = "equation";
  el.textContent = eq.text;

  // Początkowa pozycja X
  const startLeft = Math.random() * 60 + 20; // od 10% do 90%
  el.style.left = `${startLeft}%`;
  el.style.top = "0px";

  equationArea.appendChild(el);

  equations.push({
    el: el,
    result: eq.result,
    y: 0,
    x: el.offsetLeft, // W pikselach
    direction: Math.random() < 0.5 ? 1 : -1, // losowy start: lewo/prawo
    xTravel: 0
  });
}


function fall(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
    lastSpawnTime = timestamp;
  }

  const delta = timestamp - lastTime;

  const line = document.getElementById("line");
  const equationAreaRect = equationArea.getBoundingClientRect();
  const lineRect = line.getBoundingClientRect();

  // Pozycja linii względem equationArea
  const lineTopRelativeToEquationArea = lineRect.top - equationAreaRect.top;

equations.forEach((eq) => {
    if (eq.isDying) return; // pomiń rozpadujące się działania
  eq.y += speed * delta;
  eq.el.style.top = eq.y + "px";

  // Oscylacja w poziomie
  const xSpeed = 0.05 * delta; // prędkość pozioma
  eq.x += eq.direction * xSpeed;
  eq.xTravel += xSpeed;

  // Po 10px w jedną stronę – zmiana kierunku
  if (eq.xTravel >= 40) {
    eq.direction *= -1;
    eq.xTravel = 0;
  }

  eq.el.style.left = eq.x + "px";

  const eqHeight = eq.el.offsetHeight;

  const equationAreaRect = equationArea.getBoundingClientRect();
  const lineRect = line.getBoundingClientRect();
  const lineTopRelativeToEquationArea = lineRect.top - equationAreaRect.top;
  const eqBottomRelativeToEquationArea = eq.y + eqHeight;

  if (eqBottomRelativeToEquationArea >= lineTopRelativeToEquationArea) {
    endGame();
  }
});


  if (timestamp - lastSpawnTime >= spawnInterval) {
    spawnEquation();
    lastSpawnTime = timestamp;
  }

  lastTime = timestamp;

  animationFrame = requestAnimationFrame(fall);

}



let correctAnswers = 0; // Poprawne odpowiedzi

function startGame() {
document.getElementById("start-screen").style.display = "none";
document.getElementById("end-screen").style.display = "none";
document.getElementById("game-over").style.display = "none";
document.getElementById("fail-screen").style.display = "none";

  input.disabled = false;
  input.value = "";
  equations = [];
  gameOverText.style.display = "none";
  document.getElementById("end-screen").style.display = "none"; 
  correctAnswers = 0;
  equationArea.innerHTML = "";

  lastTime = 0;
  lastSpawnTime = 0;

  spawnEquation(); // pierwsze działanie
  animationFrame = requestAnimationFrame(fall);
}

function endGame() {
     cancelAnimationFrame(animationFrame);
        input.disabled = true;
        document.getElementById("fail-screen").style.display = "flex";
}


input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const answer = parseInt(input.value.trim());
if (isNaN(answer)) return;

    input.value = "";

    let foundIndex = -1;

    for (let i = 0; i < equations.length; i++) {
      if (answer === equations[i].result) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      const eq = equations[foundIndex];
      eq.el.classList.add("disintegrate");
      eq.isDying = true;
      eq.el.addEventListener("animationend", () => {
        if (eq.el.parentElement) {
          eq.el.parentElement.removeChild(eq.el);
        }
        equations.splice(foundIndex, 1);
      }, { once: true });
           
      correctAnswers++;  

      if (correctAnswers >= 10) {
        cancelAnimationFrame(animationFrame);
        input.disabled = true;
        document.getElementById("end-screen").style.display = "flex";
      }
    } else {
      endGame(); 
    }
  }
});

function showStartScreenThenStartGame() {

  document.getElementById("end-screen").style.display = "none";
  document.getElementById("game-over").style.display = "none";
  document.getElementById("fail-screen").style.display = "none";

   document.getElementById("start-screen").style.display = "flex";

  // Odliczanie do rozpoczęcia gry
  setTimeout(() => {
    document.getElementById("start-screen").style.display = "none";
    startGame();
    input.focus();
  }, 3000);
}

window.onload = () => {
  showStartScreenThenStartGame();

  const restartBtn = document.getElementById("restart-btn");
  const failRestartBtn = document.getElementById("fail-restart-btn");
  

  restartBtn.addEventListener("click", () => {
    showStartScreenThenStartGame();
  });

  failRestartBtn.addEventListener("click", () => {
    
    showStartScreenThenStartGame();
  });
};



