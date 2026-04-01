import React, { useState, useRef, useEffect } from "react";
import { useGameLoop } from "../hooks/useGameLoop";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SPEED,
  BULLET_SPEED,
  ENEMY_SPEED_X,
  ENEMY_SPEED_Y,
  PLAYER_SIZE,
  ENEMY_SIZE,
  BULLET_SIZE,
} from "../game/constants";

export default function GameBoard({ onGameOver }) {
  const getInitialEnemies = (waveCount = 0) => {
    const initialEnemies = [];
    const rows = 3;
    const cols = 4;
    const startX = 110;
    const startY = 60;
    const spacingX = 60;
    const spacingY = 60;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initialEnemies.push({
          id: `enemy-w${waveCount}-${r}-${c}`,
          x: startX + c * spacingX,
          y: startY + r * spacingY,
        });
      }
    }
    return initialEnemies;
  };

  const stateRef = useRef({
    playerX: GAME_WIDTH / 2,
    bullets: [],
    enemies: getInitialEnemies(0),
    score: 0,
    lives: 5,
    rockets: 3,
    keys: {},
    lastShotTime: 0,
    enemyDirection: 1, // 1 for right, -1 for left
    enemiesKilled: 0,
    waveCount: 0,
  });

  const [renderState, setRenderState] = useState(stateRef.current);

  // Keyboard controls with fallback to e.key
  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code || e.key;
      stateRef.current.keys[code] = true;
      if (
        code === "Space" ||
        code === " " ||
        code === "ArrowUp" ||
        code === "ArrowDown"
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      const code = e.code || e.key;
      stateRef.current.keys[code] = false;
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.playerX = Math.max(
      PLAYER_SIZE.width / 2,
      Math.min(GAME_WIDTH - PLAYER_SIZE.width / 2, x),
    );
  };

  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  useGameLoop((deltaTime) => {
    const state = stateRef.current;

    // Player Movement (Keyboard fallback, smooth pointer is main now)
    if (state.keys["ArrowLeft"] || state.keys["KeyA"] || state.keys["a"]) {
      state.playerX = Math.max(
        PLAYER_SIZE.width / 2,
        state.playerX - PLAYER_SPEED,
      );
    }
    if (state.keys["ArrowRight"] || state.keys["KeyD"] || state.keys["d"]) {
      state.playerX = Math.min(
        GAME_WIDTH - PLAYER_SIZE.width / 2,
        state.playerX + PLAYER_SPEED,
      );
    }

    // Shooting
    if (state.keys["Space"] || state.keys[" "] || state.keys["Fire"]) {
      const now = Date.now();
      if (now - state.lastShotTime > 50) {
        state.bullets.push(
          { id: now + "-L", x: state.playerX - 15, y: GAME_HEIGHT - 60 },
          { id: now + "-R", x: state.playerX + 15, y: GAME_HEIGHT - 60 },
        );
        state.lastShotTime = now;
      }
    }

    // Update Bullets
    let updatedBullets = [];
    for (let b of state.bullets) {
      if (b.y > -20) {
        updatedBullets.push({ ...b, y: b.y + BULLET_SPEED });
      }
    }
    state.bullets = updatedBullets;

    // Update Enemies
    let moveDown = false;
    let newDirection = state.enemyDirection;

    for (let enemy of state.enemies) {
      if (enemy.x > GAME_WIDTH - 30 && state.enemyDirection === 1) {
        newDirection = -1;
        moveDown = true;
        break;
      }
      if (enemy.x < 30 && state.enemyDirection === -1) {
        newDirection = 1;
        moveDown = true;
        break;
      }
    }

    state.enemyDirection = newDirection;

    state.enemies = state.enemies.map((enemy) => ({
      ...enemy,
      x: enemy.x + ENEMY_SPEED_X * state.enemyDirection,
      y: enemy.y + (moveDown ? 40 : ENEMY_SPEED_Y),
    }));

    // Collisions: Bullets vs Enemies
    const remainingBullets = [];
    state.bullets.forEach((bullet) => {
      let hit = false;
      state.enemies = state.enemies.filter((enemy) => {
        if (hit) return true;

        const bulletRect = {
          x: bullet.x - BULLET_SIZE.width / 2,
          y: bullet.y - BULLET_SIZE.height / 2,
          width: BULLET_SIZE.width,
          height: BULLET_SIZE.height,
        };
        const enemyRect = {
          x: enemy.x - ENEMY_SIZE.width / 2,
          y: enemy.y - ENEMY_SIZE.height / 2,
          width: ENEMY_SIZE.width,
          height: ENEMY_SIZE.height,
        };

        if (checkCollision(bulletRect, enemyRect)) {
          hit = true;
          state.score += 10;
          state.enemiesKilled += 1;
          return false; // remove enemy
        }
        return true;
      });
      if (!hit) remainingBullets.push(bullet);
    });
    state.bullets = remainingBullets;

    // Collisions: Enemies vs Player
    const playerRect = {
      x: state.playerX - PLAYER_SIZE.width / 2,
      y: GAME_HEIGHT - 60 - PLAYER_SIZE.height / 2,
      width: PLAYER_SIZE.width,
      height: PLAYER_SIZE.height,
    };

    let livesLost = 0;
    state.enemies = state.enemies.filter((enemy) => {
      const enemyRect = {
        x: enemy.x - ENEMY_SIZE.width / 2,
        y: enemy.y - ENEMY_SIZE.height / 2,
        width: ENEMY_SIZE.width,
        height: ENEMY_SIZE.height,
      };
      if (checkCollision(playerRect, enemyRect) || enemy.y > GAME_HEIGHT) {
        livesLost += 1;
        return false; // remove from game
      }
      return true;
    });
    state.lives -= livesLost;

    if (state.lives <= 0) {
      setTimeout(() => onGameOver(state.score, false), 0);
      return;
    }

    if (state.enemies.length === 0) {
      if (state.enemiesKilled >= 500) {
        setTimeout(() => onGameOver(state.score + 1000, true), 0);
        return;
      } else {
        state.waveCount += 1;
        state.enemies = getInitialEnemies(state.waveCount);
      }
    }

    if (state.enemiesKilled >= 500) {
      setTimeout(() => onGameOver(state.score + 1000, true), 0);
      return;
    }

    setRenderState({
      playerX: state.playerX,
      bullets: state.bullets,
      enemies: state.enemies,
      score: state.score,
      lives: state.lives,
      rockets: state.rockets,
    });
  });

  return (
    <>
      <div className="hud-bar">
        <div className="lives-display">
          {renderState.lives} <span style={{ color: "#ff00ea" }}>♥</span>{" "}
          {renderState.rockets} <span style={{ color: "#00f3ff" }}>🚀</span>
        </div>
        <div className="score-display">{renderState.score}</div>
      </div>

      {/* Pointer events handle mouse and touch without needing window focus */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          touchAction: "none",
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={() => (stateRef.current.keys["Fire"] = true)}
        onPointerUp={() => (stateRef.current.keys["Fire"] = false)}
        onPointerLeave={() => (stateRef.current.keys["Fire"] = false)}
      >
        {/* Player using the CSS classes to load the copied assets */}
        <div
          className="sprite player-ship"
          style={{
            position: "absolute",
            left: renderState.playerX,
            top: GAME_HEIGHT - 50,
            width: PLAYER_SIZE.width,
            height: PLAYER_SIZE.height,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        />

        {/* Bullets */}
        {renderState.bullets.map((b) => (
          <div
            key={b.id}
            className="bullet"
            style={{
              left: b.x,
              top: b.y,
              width: BULLET_SIZE.width,
              height: BULLET_SIZE.height,
            }}
          />
        ))}

        {/* Enemies using CSS classes */}
        {renderState.enemies.map((e) => (
          <div
            key={e.id}
            className="sprite enemy-ship"
            style={{
              position: "absolute",
              left: e.x,
              top: e.y,
              width: ENEMY_SIZE.width,
              height: ENEMY_SIZE.height,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
            }}
          />
        ))}
      </div>
    </>
  );
}
