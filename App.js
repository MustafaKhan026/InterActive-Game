import React, { useState } from 'react';
import SelectFruitScreen from './components/SelectFruitScreen';
import GameScreen        from './components/GameScreen';

export default function App() {
  const [targetFruit, setTargetFruit] = useState(null);

  const handleConfirm = (fruit) => setTargetFruit(fruit);
  const handleGameEnd = () => setTargetFruit(null); // go back to selection

  if (!targetFruit) {
    return <SelectFruitScreen onConfirm={handleConfirm} />;
  }

  return <GameScreen targetFruit={targetFruit} onGameEnd={handleGameEnd}  autoStart/>;
}