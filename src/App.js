import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { requestNotifications } from 'react-native-permissions';

import AppNavigator from './navigation/AppNavigator';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import TTSService from './services/tts/TTSService';
import NotificationService from './services/notification/NotificationService';
import { StorageService } from './services/storage/StorageService';
import LoadingScreen from './components/common/LoadingScreen';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserData, setHasUserData] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 알림 권한 요청
      await requestNotificationPermission();
      
      // TTS 초기화
      await TTSService.initialize();
      
      // 알림 서비스 초기화  
      await NotificationService.initialize();
      
      // 사용자 데이터 확인
      const userData = await StorageService.getUserData();
      setHasUserData(!!userData);
      
      // 앱 시작 음성 안내
      if (userData) {
        await TTSService.speak(`안녕하세요, ${userData.name || '농업인'}님! 고창 농업 알리미입니다.`);
      }
      
    } catch (error) {
      console.error('앱 초기화 오류:', error);
      Alert.alert('오류', '앱을 시작하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await requestNotifications(['alert', 'sound', 'badge']);
      if (result.status !== 'granted') {
        Alert.alert(
          '알림 권한 필요', 
          '농업 사업 알림을 받으려면 알림 권한이 필요합니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('알림 권한 요청 오류:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <NavigationContainer>
              <StatusBar 
                backgroundColor="#FFF8DC" 
                barStyle="dark-content" 
                translucent={false}
              />
              <AppNavigator initialRoute={hasUserData ? 'Main' : 'UserRegistration'} />
            </NavigationContainer>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
