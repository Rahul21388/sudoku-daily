import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore(s => s.updateSetting);

  const SettingRow = ({ label, value, onValueChange, type = 'switch', options = [] }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFF"
        />
      ) : (
        <View style={styles.segmented}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => onValueChange(opt)}
              style={[
                styles.segBtn,
                value === opt && { backgroundColor: colors.primary }
              ]}
            >
              <Text style={[
                styles.segText,
                { color: value === opt ? '#FFF' : colors.textSecondary }
              ]}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
          <SettingRow
            label="Theme"
            value={settings.theme}
            type="segmented"
            options={['light', 'dark', 'system']}
            onValueChange={(v) => updateSetting('theme', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Gameplay</Text>
          <SettingRow
            label="Mistake Limit (3)"
            value={settings.mistakesLimit}
            onValueChange={(v) => updateSetting('mistakesLimit', v)}
          />
          <SettingRow
            label="Haptic Feedback"
            value={settings.hapticEnabled}
            onValueChange={(v) => updateSetting('hapticEnabled', v)}
          />
          <SettingRow
            label="Show Timer"
            value={settings.timerVisible}
            onValueChange={(v) => updateSetting('timerVisible', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Assistance</Text>
          <SettingRow
            label="Highlight Peer Cells"
            value={settings.highlightPeers}
            onValueChange={(v) => updateSetting('highlightPeers', v)}
          />
          <SettingRow
            label="Highlight Same Numbers"
            value={settings.highlightSameNumber}
            onValueChange={(v) => updateSetting('highlightSameNumber', v)}
          />
          <SettingRow
            label="Auto-remove Notes"
            value={settings.autoRemoveNotes}
            onValueChange={(v) => updateSetting('autoRemoveNotes', v)}
          />
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  content: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 32, marginTop: 12 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16, fontWeight: '500' },
  segmented: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 8, padding: 2 },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  segText: { fontSize: 12, fontWeight: '600' },
  version: { textAlign: 'center', marginTop: 20, marginBottom: 40, fontSize: 12 },
});
