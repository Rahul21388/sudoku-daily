import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useOTAUpdate() {
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (__DEV__) return;

    async function checkForUpdate() {
      try {
        setIsChecking(true);
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version of Sudoku Daily has been downloaded. Restart the app to apply it.',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Restart Now',
                onPress: async () => await Updates.reloadAsync(),
              },
            ],
            { cancelable: false },
          );
        }
      } catch {
        // Silently fail
      } finally {
        setIsChecking(false);
      }
    }

    checkForUpdate();
  }, []);

  return { isChecking };
}