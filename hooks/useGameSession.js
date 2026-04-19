import { useRef, useCallback } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../config/firebase';
import { getRandomFruits, GAME_DURATION, TAP_TYPES } from '../utils/gameHelper';

export default function useGameSession({
  setGameActive, setMetrics, setTimeLeft, targetFruit, onGameEnd
}) {
  const sessionRef = useRef(null);
  const tapsRef    = useRef([]);
  const targetRef  = useRef(null);

  const startGame = useCallback(async () => {
    try {
      tapsRef.current   = [];
      targetRef.current = targetFruit;   // ← use prop, not random
      setMetrics({ total: 0, correct: 0, incorrect: 0 });
      setTimeLeft(GAME_DURATION);

      const docRef = await addDoc(collection(db, 'gameSessions'), {
        startedAt:   serverTimestamp(),
        targetFruit: targetFruit.id,     // ← use prop
        status:      'in_progress',
      });

      sessionRef.current = docRef.id;
      setGameActive(true);

    } catch (e) {
      console.error('❌ Failed to create session:', e);
      Alert.alert(
        'Connection Error',
        'Could not start a new session. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  }, [targetFruit]);

  const endGame = useCallback(async (taps, clearFruitTimeout, resetGame) => {
    setGameActive(false);
    clearFruitTimeout();

    if (!sessionRef.current) {
      console.warn('⚠️ endGame called with no valid session ID — skipping Firestore save');
      return;
    }

    await new Promise(r => setTimeout(r, 2000));

    const total      = taps.length;
    const correct    = taps.filter(t => t.tapType === TAP_TYPES.CORRECT).length;
    const incorrect  = taps.filter(t => t.tapType === TAP_TYPES.INCORRECT).length;
    const background = taps.filter(t => t.tapType === TAP_TYPES.BACKGROUND).length;
    const accuracy   = total > 0 ? parseFloat((correct / total).toFixed(4)) : 0;

    const metrics = { totalTaps: total, correctTaps: correct, incorrectTaps: incorrect, backgroundTaps: background, accuracy };

    

    try {
      const sessionDocRef     = doc(db, 'gameSessions', sessionRef.current);
      const tapsCollectionRef = collection(sessionDocRef, 'taps');

      await updateDoc(sessionDocRef, {
        endedAt:  serverTimestamp(),
        status:   'completed',
        duration: GAME_DURATION,
        metrics,
      });

      await Promise.all(taps.map((tap, index) =>
        addDoc(tapsCollectionRef, {
          index,
          timestamp:   tap.timestamp,
          coordinates: { x: tap.x, y: tap.y },
          tapType:     tap.tapType,
          fruitId:     tap.fruitId  ?? null,
          photoURI:    tap.photoURL ?? null,
        })
      ));

    } catch (e) {
      console.error('❌ Firestore save failed:', e);
    }

    Alert.alert(
      '✅ Session Ended',
      `Taps: ${total}  |  Correct: ${correct}  |  Incorrect: ${incorrect}\nAccuracy: ${(accuracy * 100).toFixed(1)}%`,
      [{
        text: 'OK',
        onPress: () => {
          sessionRef.current = null;
          resetGame();
          onGameEnd();   // ← go back to SelectFruitScreen
        }
      }]
    );
  }, [targetFruit, onGameEnd]);

  return { sessionRef, tapsRef, targetRef, startGame, endGame };
}