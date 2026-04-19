import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';

export default function StartOverlay({ onStart }) {
  return (
    <TouchableWithoutFeedback onPress={onStart}>
      <View style={styles.overlay}>
        <Text style={styles.title}>🎮 Tap to Start</Text>
        <Text style={styles.sub}>Find the target fruit for 2 minutes!</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sub: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
});