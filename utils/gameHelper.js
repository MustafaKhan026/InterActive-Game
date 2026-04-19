import Apple from "../assets/icons/apple.svg"
import Banana from "../assets/icons/banana.svg"
import Grape from "../assets/icons/grapes.svg"
import Carrot from "../assets/icons/carrot.svg"

export const TAP_TYPES = {
  CORRECT:    'correct',
  INCORRECT:  'incorrect',
  BACKGROUND: 'background',
};

export const FRUITS = [
  { id: 'apple',  label: 'Apple',  Icon: Apple  },
  { id: 'banana', label: 'Banana', Icon: Banana },
  { id: 'grape',  label: 'Grape',  Icon: Grape  },
  { id: 'carrot', label: 'Carrot', Icon: Carrot },
];

export const GAME_DURATION = 120; // 2 minutes in seconds
export const FRUIT_VISIBLE_DURATION = 1500; // ms fruit stays visible
export const FRUIT_INTERVAL = 900; // ms between fruit spawns
export const FRUIT_SIZE = 70;

// Pick 4 unique random fruits each round
export const getRandomFruits = () => {
  const shuffled = [...FRUITS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

// Generate random position within screen bounds
export const getRandomPosition = (screenWidth, screenHeight, fruitSize) => {
  const padding = fruitSize;
  return {
    x: Math.random() * (screenWidth - padding * 2) + padding,
    y: Math.random() * (screenHeight - padding * 2) + padding,
  };
};

// Check if a tap hit a fruit
export const isTapOnFruit = (tapX, tapY, fruitX, fruitY, fruitSize) => {
  const half = fruitSize / 2;
  return (
    tapX >= fruitX - half &&
    tapX <= fruitX + half &&
    tapY >= fruitY - half &&
    tapY <= fruitY + half
  );
};