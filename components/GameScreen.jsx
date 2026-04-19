import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  isTapOnFruit,
  GAME_DURATION,
  FRUIT_SIZE,
  TAP_TYPES,
} from "../utils/gameHelper";

import FruitItem from "./game/FruitItem";
import GameHUD       from './game/GameHud';
// import StartOverlay from "./game/StartOverlay";
import PermissionGate from "./game/PermissionGate";

import useCamera from "../hooks/useCamera";
import useFruitSpawner from "../hooks/useFruitSpawner";
import useGameSession from "../hooks/useGameSession";

const { width: SW, height: SH } = Dimensions.get("window");

export default function GameScreen({ targetFruit, onGameEnd,autoStart }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeFruits, setActiveFruits] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
  });

  const { cameraRef, capturePhoto } = useCamera();

  const { tapsRef, targetRef, startGame, endGame } = useGameSession({
    setGameActive,
    setMetrics,
    setTimeLeft,
    targetFruit,
    onGameEnd,
});

  const fruitsRef = React.useRef([]);

  const handleFruitsChange = useCallback((fruits) => {
    setActiveFruits(fruits);
    fruitsRef.current = fruits;
  }, []);

  const { clearFruitTimeout } = useFruitSpawner({
    gameActive,
    onFruitsChange: handleFruitsChange,
  });
  useEffect(() => {
    if (autoStart) startGame();
  }, []);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // Countdown timer
  // Define resetGame in GameScreen.jsx
const resetGame = useCallback(() => {
  setActiveFruits([]);
  setTimeLeft(GAME_DURATION);
  setMetrics({ total: 0, correct: 0, incorrect: 0 });
  fruitsRef.current = [];
}, []);

// Update the timer useEffect to pass it in
useEffect(() => {
  if (!gameActive) return;
  if (timeLeft <= 0) {
    endGame(tapsRef.current, clearFruitTimeout, resetGame);
    return;
  }
  const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
  return () => clearTimeout(timer);
}, [gameActive, timeLeft]);

  // Handle screen tap
  const handleScreenTap = useCallback(
    (evt) => {
      if (!gameActive) return;
      const { locationX: x, locationY: y } = evt.nativeEvent;
      const timestamp = Date.now();

      let tapType = TAP_TYPES.BACKGROUND;
      let fruitHit = null;

      for (const fruit of fruitsRef.current) {
        if (isTapOnFruit(x, y, fruit.x, fruit.y, FRUIT_SIZE)) {
          fruitHit = fruit;
          tapType =
            fruit.id === targetRef.current.id
              ? TAP_TYPES.CORRECT
              : TAP_TYPES.INCORRECT;
          break;
        }
      }

      const tapRecord = {
        x,
        y,
        timestamp,
        tapType,
        fruitId: fruitHit?.id || null,
        photoURL: null,
      };
      tapsRef.current.push(tapRecord);

      setMetrics((prev) => ({
        total: prev.total + 1,
        correct: prev.correct + (tapType === TAP_TYPES.CORRECT ? 1 : 0),
        incorrect: prev.incorrect + (tapType === TAP_TYPES.INCORRECT ? 1 : 0),
      }));

      capturePhoto(tapRecord).then((uri) => {
        if (uri) tapRecord.photoURL = uri;
      });
    },
    [gameActive, capturePhoto],
  );

  if (!permission?.granted) {
    return <PermissionGate onRequest={requestPermission} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.hiddenCamera}
        facing="front"
        animateShutter={false}
      />

      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <View style={styles.gameLayer}>
          <GameHUD
            timeLeft={timeLeft}
            targetFruit={targetFruit}
            metrics={metrics}
          />

          {activeFruits.map((fruit) => (
            <FruitItem
              key={fruit.instanceId}
              fruit={fruit}
              onPress={(f) =>
                handleScreenTap({
                  nativeEvent: { locationX: f.x, locationY: f.y },
                })
              }
            />
          ))}

          {/* {!gameActive && <StartOverlay onStart={startGame} />} */}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  hiddenCamera: { width: 1, height: 1, opacity: 0 },
  gameLayer: { ...StyleSheet.absoluteFillObject },
});
