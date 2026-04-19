import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PermissionGate({ onRequest }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        📷 Camera access is needed to capture tap photos.
      </Text>
      <TouchableOpacity onPress={onRequest}>
        <Text style={styles.btn}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  btn: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
});