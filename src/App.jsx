import React, { useState } from 'react';
import GameBoard from './components/GameBoard';

function App() {
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER, SUCCESS
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => {
    setGameState('PLAYING');
  };

  const gameOver = (score, isSuccess = false) => {
    setFinalScore(score);
    setGameState(isSuccess ? 'SUCCESS' : 'GAMEOVER');
  };

  return (
    <div className="game-container" style={{ width: 400, height: 700 }}>
      {gameState === 'START' && (
        <div className="start-screen">
          <h1>Nebula<br/>Striker</h1>
          <button className="btn-primary" onClick={startGame}>Initialize</button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <GameBoard onGameOver={gameOver} />
      )}

      {gameState === 'GAMEOVER' && (
        <div className="game-over-screen">
          <h1>Mission<br/>Failed</h1>
          <p style={{fontFamily: 'Orbitron', fontSize: '24px', marginBottom: '20px', color: '#00f3ff'}}>Score: {finalScore}</p>
          <button className="btn-primary" onClick={startGame}>Restart</button>
        </div>
      )}

      {gameState === 'SUCCESS' && (
        <div className="game-over-screen">
          <h1 style={{background: '-webkit-linear-gradient(#00ffaa, #00f3ff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Mission<br/>Accomplished</h1>
          <p style={{fontFamily: 'Orbitron', fontSize: '24px', marginBottom: '20px', color: '#00f3ff'}}>Score: {finalScore}</p>
          <button className="btn-primary" onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
