import React, { memo } from 'react';
import { Text } from 'react-native';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const Timer = memo(({ seconds, color, fontSize = 18 }) => {
  return (
    <Text style={{ color, fontSize, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
      {formatTime(seconds)}
    </Text>
  );
});

Timer.displayName = 'Timer';
export { formatTime };
export default Timer;
