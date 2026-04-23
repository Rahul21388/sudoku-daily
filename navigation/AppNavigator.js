import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

import DailyScreen from '../screens/DailyScreen';
import PlayScreen from '../screens/PlayScreen';
import MiniSudokuScreen from '../screens/MiniSudokuScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GameScreen from '../screens/GameScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Daily:    { active: 'calendar',         inactive: 'calendar-outline' },
  Play:     { active: 'game-controller',  inactive: 'game-controller-outline' },
  Mini:     { active: 'grid',             inactive: 'grid-outline' },
  Stats:    { active: 'bar-chart',        inactive: 'bar-chart-outline' },
  Settings: { active: 'settings',         inactive: 'settings-outline' },
};

function TabIcon({ name, focused, color, size }) {
  const icon = TAB_ICONS[name];
  if (!icon) return null;
  return (
    <Ionicons
      name={focused ? icon.active : icon.inactive}
      size={size}
      color={color}
    />
  );
}

function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Daily"    component={DailyScreen} />
      <Tab.Screen name="Play"     component={PlayScreen} />
      <Tab.Screen name="Mini"     component={MiniSudokuScreen} />
      <Tab.Screen name="Stats"    component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            gestureEnabled: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
