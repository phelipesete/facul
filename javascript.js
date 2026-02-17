const canvas = document.getElementById('marioCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 450;

const gravity = 0.6;
const friction = 0.8;
let gameWon = false; // Variável para controlar o estado de vitória

const camera = { y: 0 };

const player = {
    x: 400,
    y: 350,
    width: 30,
    height: 30,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    color: "#E74C3C"
};

// Gerador de plataformas
const platforms = [
    { x: 0, y: 400, width: 800, height: 50 }, // Chão inicial
];

// Criar 15 plataformas subindo
for (let i = 1; i <= 15; i++) {
    platforms.push({
        x: Math.random() * (canvas.width - 150),
        y: 400 - (i * 120), // Aumentei um pouco a distância para ficar desafiador
        width: 130,
        height: 20
    });
}

// A BANDEIRA DE CHEGADA (Fica na última plataforma)
const lastPlatform = platforms[platforms.length - 1];
const goal = {
    x: lastPlatform.x + 50,
    y: lastPlatform.y - 100, // Fica em cima da plataforma
    width: 10,
    height: 100
};

const keys = {};
let touchLeft = false, touchRight = false;

window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

function setupTouchBtn(id, callback) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); callback(true); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); callback(false); });
}

setupTouchBtn('leftBtn', val => touchLeft = val);
setupTouchBtn('rightBtn', val => touchRight = val);
document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!player.jumping && !gameWon) { player.velY = -15; player.jumping = true; }
});

function update() {
    if (gameWon) return; // Para o movimento se ganhou

    // Controles
    if (keys["ArrowRight"] || touchRight) { if (player.velX < player.speed) player.velX++; }
    if (keys["ArrowLeft"] || touchLeft) { if (player.velX > -player.speed) player.velX--; }
    if ((keys["Space"] || keys["ArrowUp"]) && !player.jumping) {
        player.velY = -15;
        player.jumping = true;
    }

    player.velX *= friction;
    player.velY += gravity;
    player.x += player.velX;
    player.y += player.velY;

    // Câmera segue o player
    let targetCameraY = player.y - canvas.height / 2;
    if (targetCameraY < camera.y) {
        camera.y += (targetCameraY - camera.y) * 0.1;
    }

    // Colisão com Plataformas
    player.jumping = true;
    for (let plat of platforms) {
        if (player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y + player.height > plat.y &&
            player.y + player.height < plat.y + plat.height + player.velY + 1) {
            
            if (player.velY > 0) {
                player.jumping = false;
                player.y = plat.y - player.height;
                player.velY = 0;
            }
        }
    }

    // VERIFICAR VITÓRIA (Colisão com o mastro da bandeira)
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        gameWon = true;
    }

    // Limites e Reset
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y > camera.y + canvas.height + 200) {
        player.x = 400; player.y = 350; player.velY = 0; camera.y = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -camera.y);

    // Desenhar Plataformas
    for (let plat of platforms) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = "#2ECC71";
        ctx.fillRect(plat.x, plat.y, plat.width, 6);
    }

    // DESENHAR BANDEIRA
    ctx.fillStyle = "#333"; // Mastro
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = "white"; // Pano da bandeira
    ctx.fillRect(goal.x + 10, goal.y, 30, 20);
    ctx.strokeStyle = "black";
    ctx.strokeRect(goal.x + 10, goal.y, 30, 20);

    // Desenhar Mario
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();

    // TELA DE VITÓRIA
    if (gameWon) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("VOCÊ CHEGOU AO TOPO!", canvas.width/2, canvas.height/2);
        ctx.font = "20px Arial";
        ctx.fillText("Recarregue a página para jogar de novo", canvas.width/2, canvas.height/2 + 40);
    }

    requestAnimationFrame(draw);
}

draw();
