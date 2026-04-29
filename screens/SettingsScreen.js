import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';
import HowToPlayModal from '../components/HowToPlayModal';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rahulprakash.sudokudaily';
const FEEDBACK_EMAIL = 'admin@rahulprakash.co.in';
const PRIVACY_POLICY_URL = 'https://rahulprakash.co.in/apps/sudokudaily/privacy';
const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore(s => s.updateSetting);
  const resetSettings = useSettingsStore(s => s.resetSettings); // add this action to your store

  const [howToPlayVisible, setHowToPlayVisible] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleRateUs = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() =>
      Alert.alert('Error', 'Could not open the Play Store.')
    );
  };

  const handleFeedback = () => {
    const subject = encodeURIComponent('Sudoku Daily – Feedback');
    const body = encodeURIComponent(`App Version: ${APP_VERSION}\n\nFeedback:\n`);
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert('Error', 'No email client found on this device.')
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() =>
      Alert.alert('Error', 'Could not open the privacy policy.')
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've been playing Sudoku Daily – a clean, ad-free Sudoku app. Give it a try!\n${PLAY_STORE_URL}`,
        title: 'Sudoku Daily',
      });
    } catch {
      Alert.alert('Error', 'Could not open the share sheet.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'This will restore all settings to their defaults. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetSettings?.() },
      ]
    );
  };

  // ─── Sub-components ─────────────────────────────────────────────────────────

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
  );

  const ToggleRow = ({ label, value, onValueChange }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  const SegmentedRow = ({ label, value, options, onValueChange }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.segmented, { backgroundColor: colors.border }]}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onValueChange(opt)}
            style={[styles.segBtn, value === opt && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.segText, { color: value === opt ? '#FFF' : colors.textSecondary }]}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const LinkRow = ({ label, icon, onPress, destructive = false }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.linkLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? (colors.error ?? '#E53E3E') : colors.primary}
          style={styles.linkIcon}
        />
        <Text style={[styles.label, { color: destructive ? (colors.error ?? '#E53E3E') : colors.text }]}>
          {label}
        </Text>
      </View>
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Appearance */}
        <View style={styles.section}>
          <SectionHeader title="Appearance" />
          <SegmentedRow
            label="Theme"
            value={settings.theme}
            options={['light', 'dark', 'system']}
            onValueChange={(v) => updateSetting('theme', v)}
          />
        </View>

        {/* Gameplay */}
        <View style={styles.section}>
          <SectionHeader title="Gameplay" />
          <ToggleRow
            label="Mistake Limit (3)"
            value={settings.mistakesLimit}
            onValueChange={(v) => updateSetting('mistakesLimit', v)}
          />
          <ToggleRow
            label="Haptic Feedback"
            value={settings.hapticEnabled}
            onValueChange={(v) => updateSetting('hapticEnabled', v)}
          />
          <ToggleRow
            label="Show Timer"
            value={settings.timerVisible}
            onValueChange={(v) => updateSetting('timerVisible', v)}
          />
        </View>

        {/* Assistance */}
        <View style={styles.section}>
          <SectionHeader title="Assistance" />
          <ToggleRow
            label="Highlight Peer Cells"
            value={settings.highlightPeers}
            onValueChange={(v) => updateSetting('highlightPeers', v)}
          />
          <ToggleRow
            label="Highlight Same Numbers"
            value={settings.highlightSameNumber}
            onValueChange={(v) => updateSetting('highlightSameNumber', v)}
          />
          <ToggleRow
            label="Auto-remove Notes"
            value={settings.autoRemoveNotes}
            onValueChange={(v) => updateSetting('autoRemoveNotes', v)}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <LinkRow label="How to Play"           icon="help-circle-outline"      onPress={() => setHowToPlayVisible(true)} />
          <LinkRow label="Rate Us on Play Store"  icon="star-outline"             onPress={handleRateUs} />
          <LinkRow label="Send Feedback"          icon="mail-outline"             onPress={handleFeedback} />
          <LinkRow label="Share with Friends"     icon="share-social-outline"     onPress={handleShare} />
          <LinkRow label="Privacy Policy"         icon="shield-checkmark-outline" onPress={handlePrivacyPolicy} />
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <SectionHeader title="Advanced" />
          <LinkRow
            label="Reset All Settings"
            icon="refresh-outline"
            onPress={handleResetSettings}
            destructive
          />
        </View>

        {/* About */}
        <View style={[styles.aboutBox, { backgroundColor: colors.border + '33' }]}>
          <Text style={[styles.aboutAppName, { color: colors.text }]}>Sudoku Daily</Text>
          <Text style={[styles.aboutMeta, { color: colors.textSecondary }]}>Version {APP_VERSION}</Text>
          <Text style={[styles.aboutMeta, { color: colors.textSecondary }]}>Made with ♟ by Rahul Prakash</Text>
        </View>

      </ScrollView>

      <HowToPlayModal
        visible={howToPlayVisible}
        onClose={() => setHowToPlayVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  content: { paddingBottom: 48 },

  title: { fontSize: 28, fontWeight: '800', marginBottom: 32, marginTop: 12 },

  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 16, fontWeight: '500' },

  segmented: { flexDirection: 'row', borderRadius: 8, padding: 2 },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  segText: { fontSize: 12, fontWeight: '600' },

  linkLeft: { flexDirection: 'row', alignItems: 'center' },
  linkIcon: { marginRight: 12 },

  aboutBox: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  aboutAppName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  aboutMeta: { fontSize: 13, marginTop: 2 },
});