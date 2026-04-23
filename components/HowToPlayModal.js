import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

const { height } = Dimensions.get('window');

const STEPS = [
  {
    icon: '🎯',
    title: 'Objective',
    body: 'Fill every cell in the 9×9 grid so that each row, column, and 3×3 box contains the digits 1 through 9 — each exactly once.',
    illustration: 'grid',
  },
  {
    icon: '🔲',
    title: 'The Grid',
    body: 'The grid is split into 9 rows, 9 columns, and nine 3×3 boxes. Every unit must contain all digits 1–9 with no repetition.',
    illustration: null,
  },
  {
    icon: '📌',
    title: 'Given Numbers',
    body: 'Pre-filled cells are your clues — they cannot be changed. Fewer clues means a harder puzzle.',
    illustration: null,
  },
  {
    icon: '✏️',
    title: 'Filling Numbers',
    body: 'Tap an empty cell to select it, then tap a digit from the number pad.\n\nUse pencil/note mode to jot candidate digits — these are just reminders, not your final answer.',
    illustration: 'digits',
  },
  {
    icon: '💡',
    title: 'Tips & Tricks',
    body: '• Start where the most numbers already exist.\n• Eliminate — if a digit is in the row or column, it cannot repeat.\n• Use hints sparingly to stay challenged.\n• Mistakes highlight in red — undo to revert.',
    illustration: null,
  },
  {
    icon: '📅',
    title: 'Daily Challenge',
    body: 'A fresh puzzle drops every day. Complete it to keep your streak alive. Every player gets the same puzzle — compare your time on the leaderboard!',
    illustration: null,
  },
];

function MiniGrid({ c }) {
  const sample = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
  ];
  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      {sample.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((val, col) => (
            <View
              key={col}
              style={{
                width: 28,
                height: 28,
                borderWidth: 0.5,
                borderColor: c.border,
                backgroundColor: val !== 0 ? c.givenBg : c.emptyBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: (col + 1) % 3 === 0 && col !== 8 ? 3 : 0,
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: val !== 0 ? '700' : '400',
                color: val !== 0 ? c.givenText : c.emptyText,
              }}>
                {val !== 0 ? val : ''}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function DigitRow({ c }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <View key={n} style={{
          width: 28,
          height: 32,
          backgroundColor: c.digitBg,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: c.accent,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.accent }}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HowToPlayModal({ visible, onClose }) {
  const { colors: t, isDark } = useTheme();
  const dark = isDark ?? false;

  const c = {
    bg:          t.background,
    surface:     t.surface,
    text:        t.text,
    subtext:     t.textSecondary,
    accent:      t.primary,
    accentBg:    t.primaryLight,
    border:      t.border   ?? (dark ? '#333355' : '#D0D8F0'),
    dotInactive: dark ? '#444466' : '#D0D8F0',
    progressBg:  t.surface,
    givenBg:     t.primaryLight,
    givenText:   t.primary,
    emptyBg:     t.background,
    emptyText:   dark ? '#888' : '#BBB',
    digitBg:     t.surface,
  };

  const [step, setStep] = useState(0);
  const slideAnim  = useRef(new Animated.Value(height)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep(0);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: height, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const animateStep = (nextStep) => {
    Animated.sequence([
      Animated.timing(contentAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setStep(nextStep));
  };

  const goNext = () => {
    if (step < STEPS.length - 1) animateStep(step + 1);
    else onClose();
  };

  const goBack = () => {
    if (step > 0) animateStep(step - 1);
  };

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[
        styles.sheet,
        { backgroundColor: c.bg, transform: [{ translateY: slideAnim }] },
      ]}>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.headerTitle, { color: c.text }]}>How to Play</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: c.surface }]}>
              <Text style={[styles.closeText, { color: c.subtext }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: c.progressBg }]}>
            <View style={[
              styles.progressFill,
              { backgroundColor: c.accent, width: `${((step + 1) / STEPS.length) * 100}%` },
            ]} />
          </View>

          {/* Step counter */}
          <Text style={[styles.stepCounter, { color: c.subtext }]}>
            Step {step + 1} of {STEPS.length}
          </Text>

          {/* Content */}
          <Animated.View style={[
            styles.content,
            { opacity: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}>
            <View style={[styles.iconCircle, { backgroundColor: c.accentBg }]}>
              <Text style={styles.iconText}>{current.icon}</Text>
            </View>

            <Text style={[styles.stepTitle, { color: c.text }]}>{current.title}</Text>
            <Text style={[styles.stepBody,  { color: c.subtext }]}>{current.body}</Text>

            {current.illustration === 'grid'   && <MiniGrid c={c} />}
            {current.illustration === 'digits' && <DigitRow c={c} />}
          </Animated.View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => animateStep(i)}>
                <View style={[
                  styles.dot,
                  { backgroundColor: i === step ? c.accent : c.dotInactive, width: i === step ? 20 : 8 },
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={goBack}
              disabled={step === 0}
              style={[styles.backBtn, { borderColor: c.border, opacity: step === 0 ? 0 : 1 }]}
            >
              <Text style={[styles.backText, { color: c.accent }]}>← Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              style={[styles.nextBtn, { backgroundColor: c.accent }]}
            >
              <Text style={styles.nextText}>
                {isLast ? "Let's Play! 🎮" : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: height * 0.87,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 12,
    marginTop: 6,
    marginHorizontal: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconText: {
    fontSize: 34,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  stepBody: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 320,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});