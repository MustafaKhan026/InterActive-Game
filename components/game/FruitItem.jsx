import React, { useEffect, useRef } from 'react';
import { Animated, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { FRUIT_SIZE, FRUIT_VISIBLE_DURATION } from '../../utils/gameHelper';

export default function FruitItem({ fruit, onPress }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const Icon = fruit.Icon;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(FRUIT_VISIBLE_DURATION - 400),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.fruit, {
      left: fruit.x - FRUIT_SIZE / 2,
      top:  fruit.y - FRUIT_SIZE / 2,
      opacity,
    }]}>
      <TouchableWithoutFeedback onPress={() => onPress(fruit)}>
        <View style={styles.fruitInner}>
          <Icon width={FRUIT_SIZE - 16} height={FRUIT_SIZE - 16} />
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fruit: {
    position: 'absolute',
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
  },
  fruitInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});