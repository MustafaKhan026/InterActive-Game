import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Home from '../../assets/icons/home.svg';

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function GameHUD({ timeLeft, targetFruit, metrics }) {
  return (
    <View style={styles.hud}>
      <Text style={styles.hudText}><Home/></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  hudTarget: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});