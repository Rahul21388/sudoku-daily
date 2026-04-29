import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
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

const TOTAL = STEPS.length;

// ─── Illustrations ────────────────────────────────────────────────────────────

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
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <View style={styles.digitRow}>
      {digits.map(n => (
        <View key={n} style={[styles.digitCell, { backgroundColor: c.digitBg, borderColor: c.accent }]}>
          <Text style={[styles.digitText, { color: c.accent }]}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HowToPlayModal({ visible, onClose }) {
  const { colors: t, isDark } = useTheme();
  const dark = isDark ?? false;

  const c = {
    bg:          t.background,
    surface:     t.surface ?? (dark ? '#1E1E2E' : '#F8F9FF'),
    text:        t.text,
    subtext:     t.textSecondary,
    accent:      t.primary,
    accentBg:    t.primaryLight ?? (dark ? t.primary + '33' : t.primary + '18'),
    border:      t.border ?? (dark ? '#333355' : '#D0D8F0'),
    dotInactive: dark ? '#444466' : '#D0D8F0',
    givenBg:     t.primaryLight ?? t.primary + '18',
    givenText:   t.primary,
    emptyBg:     t.background,
    emptyText:   dark ? '#888' : '#BBB',
    digitBg:     t.surface ?? (dark ? '#1E1E2E' : '#F8F9FF'),
  };

  const [step, setStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0); // what's actually rendered during transition

  // Sheet animation
  const slideAnim  = useRef(new Animated.Value(height)).current;
  const backdropFade = useRef(new Animated.Value(0)).current;

  // Content animation — separate opacity + translateY for a lift effect
  const contentOpacity   = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;

  // Icon scale pop
  const iconScale = useRef(new Animated.Value(1)).current;

  // Progress bar — useNativeDriver:false required for width
  const progressAnim = useRef(new Animated.Value(1 / TOTAL)).current;

  // ─── Sheet open / close ─────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      setStep(0);
      setDisplayStep(0);
      progressAnim.setValue(1 / TOTAL);
      contentOpacity.setValue(1);
      contentTranslate.setValue(0);
      iconScale.setValue(1);

      Animated.parallel([
        Animated.timing(backdropFade, {
          toValue: 1, duration: 280, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, damping: 22, stiffness: 220, useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Symmetric dismiss: spring out feels jarring — use timing for smoothness
      Animated.parallel([
        Animated.timing(backdropFade, {
          toValue: 0, duration: 220, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: height, damping: 30, stiffness: 300, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ─── Step transition ────────────────────────────────────────────────────────

  const goToStep = useCallback((nextStep) => {
    if (nextStep === step) return;
    const movingForward = nextStep > step;

    // 1. Fade + slide current content out
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0, duration: 130, useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: movingForward ? -16 : 16,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Swap the rendered content while invisible
      setDisplayStep(nextStep);
      setStep(nextStep);

      // Reset translate to opposite side (content will enter from there)
      contentTranslate.setValue(movingForward ? 16 : -16);

      // 3. Advance progress bar (non-native, runs independently)
      Animated.timing(progressAnim, {
        toValue: (nextStep + 1) / TOTAL,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // 4. Pop the icon
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, damping: 10, stiffness: 300, useNativeDriver: true }),
      ]).start();

      // 5. Fade + slide new content in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }),
        Animated.spring(contentTranslate, {
          toValue: 0, damping: 20, stiffness: 280, useNativeDriver: true,
        }),
      ]).start();
    });
  }, [step]);

  const goNext = () => {
    if (step < TOTAL - 1) goToStep(step + 1);
    else onClose();
  };

  const goBack = () => {
    if (step > 0) goToStep(step - 1);
  };

  const current = STEPS[displayStep];
  const isLast  = step === TOTAL - 1;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropFade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
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
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: c.surface }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeText, { color: c.subtext }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: c.accent, width: progressWidth }]} />
          </View>

          {/* Step counter */}
          <Text style={[styles.stepCounter, { color: c.subtext }]}>
            Step {step + 1} of {TOTAL}
          </Text>

          {/* Content — scrollable so it never overflows on small screens */}
          <Animated.View style={[
            styles.contentWrapper,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}>
            <ScrollView
              contentContainerStyle={styles.contentScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View style={[styles.iconCircle, { backgroundColor: c.accentBg, transform: [{ scale: iconScale }] }]}>
                <Text style={styles.iconText}>{current.icon}</Text>
              </Animated.View>

              <Text style={[styles.stepTitle, { color: c.text }]}>{current.title}</Text>
              <Text style={[styles.stepBody, { color: c.subtext }]}>{current.body}</Text>

              {current.illustration === 'grid'   && <MiniGrid c={c} />}
              {current.illustration === 'digits' && <DigitRow c={c} />}
            </ScrollView>
          </Animated.View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToStep(i)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <View style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? c.accent : c.dotInactive,
                    width: i === step ? 20 : 8,
                  },
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navRow}>
            {/* Back — rendered but invisible at step 0, not just opacity:0 */}
            {step > 0 ? (
              <TouchableOpacity
                onPress={goBack}
                style={[styles.backBtn, { borderColor: c.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.backText, { color: c.accent }]}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}

            <TouchableOpacity
              onPress={goNext}
              style={[styles.nextBtn, { backgroundColor: c.accent }]}
              activeOpacity={0.85}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    overflow: 'hidden', // clips the progress bar flush to rounded corners
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, fontWeight: '600' },

  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: 2 },

  stepCounter: {
    fontSize: 12,
    marginTop: 6,
    marginHorizontal: 20,
    fontWeight: '500',
  },

  // Content
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  contentScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconText: { fontSize: 34 },
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

  // Digit illustration
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  digitCell: {
    width: 28, height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  digitText: { fontSize: 15, fontWeight: '700' },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  dot: { height: 8, borderRadius: 4 },

  // Nav
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
  backPlaceholder: { flex: 1 },
  backText: { fontSize: 15, fontWeight: '600' },
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