import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {/* 단계 표시 원형 인디케이터 */}
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep ? styles.activeStepCircle : styles.inactiveStepCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentStep ? styles.activeStepNumber : styles.inactiveStepNumber,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentStep ? styles.activeStepLabel : styles.inactiveStepLabel,
              ]}
            >
              {steps[index]}
            </Text>
            {/* 연결선 */}
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep ? styles.activeStepLine : styles.inactiveStepLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* 진행률 텍스트 */}
      <Text style={styles.progressText}>
        {currentStep + 1} / {totalSteps} 단계
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#111827',
  },
  inactiveStepCircle: {
    backgroundColor: '#e5e7eb',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStepNumber: {
    color: '#fff',
  },
  inactiveStepNumber: {
    color: '#9ca3af',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  activeStepLabel: {
    color: '#111827',
    fontWeight: '600',
  },
  inactiveStepLabel: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '75%',
    right: '-75%',
    height: 2,
    zIndex: -1,
  },
  activeStepLine: {
    backgroundColor: '#111827',
  },
  inactiveStepLine: {
    backgroundColor: '#e5e7eb',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});
