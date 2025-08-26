import React from 'react';
import { StyleSheet } from 'react-native';
import { OnboardingCarousel } from '../components/OnboardingCarousel';

export default function OnboardingScreen() {
  return <OnboardingCarousel />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
