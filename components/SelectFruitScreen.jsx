import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { FRUITS, FRUIT_SIZE } from '../utils/gameHelper';

export default function SelectFruitScreen({ onConfirm }) {
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Select Target Fruit</Text>
      <Text style={styles.sub}>Choose the fruit the user needs to tap</Text>

      {/* Fruit Row */}
      <View style={styles.row}>
        {FRUITS.map(fruit => {
          const Icon       = fruit.Icon;
          const isSelected = selected?.id === fruit.id;

          return (
            <TouchableOpacity
              key={fruit.id}
              style={[styles.fruitCard, isSelected && styles.fruitCardSelected]}
              onPress={() => setSelected(fruit)}
            >
              <Icon width={FRUIT_SIZE} height={FRUIT_SIZE} />
              <Text style={[styles.fruitLabel, isSelected && styles.fruitLabelSelected]}>
                {fruit.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
        onPress={() => selected && onConfirm(selected)}
        disabled={!selected}
      >
        <Text style={styles.confirmText}>
          {selected ? `Start Game with ${selected.label}` : 'Select a fruit to continue'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sub: {
    color: '#aaa',
    fontSize: 14,
    marginTop: -20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  fruitCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  fruitCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  fruitLabel: {
    color: '#aaa',
    fontSize: 13,
  },
  fruitLabelSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  confirmBtnDisabled: {
    backgroundColor: '#333',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});