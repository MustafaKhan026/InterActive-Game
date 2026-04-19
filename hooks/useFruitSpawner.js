import { useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import {
  getRandomFruits, getRandomPosition,
  FRUIT_SIZE, FRUIT_VISIBLE_DURATION, FRUIT_INTERVAL
} from '../utils/gameHelper';

const { width: SW, height: SH } = Dimensions.get('window');

export default function useFruitSpawner({ gameActive, onFruitsChange }) {
  const fruitTimeoutRef = useRef(null);

  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      const fruits    = getRandomFruits();
      const positioned = fruits.map(f => ({
        ...f,
        instanceId: `${f.id}-${Date.now()}-${Math.random()}`,
        x: getRandomPosition(SW, SH, FRUIT_SIZE).x,
        y: getRandomPosition(SW, SH, FRUIT_SIZE).y,
      }));

      onFruitsChange(positioned);

      fruitTimeoutRef.current = setTimeout(() => {
        onFruitsChange([]);
      }, FRUIT_VISIBLE_DURATION);

    }, FRUIT_INTERVAL + FRUIT_VISIBLE_DURATION);

    return () => {
      clearInterval(interval);
      if (fruitTimeoutRef.current) {
        clearTimeout(fruitTimeoutRef.current);
        fruitTimeoutRef.current = null;
      }
    };
  }, [gameActive]);

  const clearFruitTimeout = () => {
    if (fruitTimeoutRef.current) {
      clearTimeout(fruitTimeoutRef.current);
      fruitTimeoutRef.current = null;
    }
  };

  return { clearFruitTimeout };
}