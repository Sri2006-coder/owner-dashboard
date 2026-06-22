import React from 'react';
import '../global.css';
import { AppProvider } from '../context/AppContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}
