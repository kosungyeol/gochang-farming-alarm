import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';
import { StorageService } from '../../services/storage/StorageService';

const NotificationSettingsScreen = ({ navigation }) => {
  const { theme, fontSize } = useTheme();
  const { user } = useUser();
  const { settings, updateSettings } = useNotification();
  const styles = createStyles(theme, fontSize);

  const [localSettings, setLocalSettings] = useState({
    enabled: true,
    morningTime: '09:00',
    eveningTime: '18:00',
    sound: true,
    vibration: true,
    tts: true,
    deadlineReminder: true,
    weeklyDigest: true,
    ...settings
  });

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = '알림 설정 화면입니다. 원하는 알림 방식과 시간을 설정할 수 있어요.';
    await TTSService.speak(welcomeMessage);
    
    // 저장된 설정 로드
    await loadNotificationSettings();
  };

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await StorageService.getNotificationSettings();
      if (savedSettings) {
        setLocalSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('알림 설정 로드 오류:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await StorageService.saveNotificationSettings(newSettings);
      await updateSettings(newSettings);
      setLocalSettings(newSettings);
      await TTSService.speak('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const handleToggle = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    await saveSettings(newSettings);
    
    // 음성 안내
    const settingNames = {
      enabled: '알림',
      sound: '소리',
      vibration: '진동',
      tts: '음성안내',
      deadlineReminder: '마감일 알림',
      weeklyDigest: '주간요약'
    };
    
    const statusText = value ? '켜짐' : '꺼짐';
    await TTSService.speak(`${settingNames[key]} ${statusText}`);
  };

  const handleTimeChange = async (timeType) => {
    const times = ['07:00', '08:00', '09:00', '10:00', '17:00', '18:00', '19:00', '20:00'];
    const currentTime = localSettings[timeType];
    const currentIndex = times.indexOf(currentTime);
    const nextIndex = (currentIndex + 1) % times.length;
    const newTime = times[nextIndex];
    
    const newSettings = { ...localSettings, [timeType]: newTime };
    await saveSettings(newSettings);
    
    const timeTypeText = timeType === 'morningTime' ? '오전 알림' : '오후 알림';
    await TTSService.speak(`${timeTypeText} 시간이 ${newTime}로 설정되었습니다.`);
  };

  const handleTestNotification = async () => {
    try {
      await TTSService.speak('테스트 알림을 보냅니다.');
      
      Alert.alert(
        '테스트 알림',
        '이런 방식으로 농업 보조사업 알림이 전송됩니다.',
        [{ text: '확인' }]
      );
      
      if (localSettings.tts) {
        setTimeout(async () => {
          await TTSService.speak('고창군 농민수당 신청 마감이 3일 남았습니다. 놓치지 마세요!');
        }, 1000);
      }
    } catch (error) {
      console.error('테스트 알림 오류:', error);
    }
  };

  const goBack = async () => {
    await TTSService.speak('이전 화면으로 돌아갑니다.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.background, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            style={[styles.smallButton, { marginRight: 15 }]}
            onPress={goBack}
            accessibilityLabel="뒤로 가기"
          >
            <Text style={styles.buttonText}>← 뒤로</Text>
          </TouchableOpacity>
          
          <Text style={styles.titleText}>🔔 알림 설정</Text>
        </View>

        {/* 기본 알림 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>📱 기본 설정</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.bodyText}>알림 사용</Text>
            <Switch
              value={localSettings.enabled}
              onValueChange={(value) => handleToggle('enabled', value)}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.enabled ? '#FFFFFF' : theme.surface}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.bodyText}>소리</Text>
            <Switch
              value={localSettings.sound}
              onValueChange={(value) => handleToggle('sound', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.sound ? '#FFFFFF' : theme.surface}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.bodyText}>진동</Text>
            <Switch
              value={localSettings.vibration}
              onValueChange={(value) => handleToggle('vibration', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.vibration ? '#FFFFFF' : theme.surface}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.bodyText}>음성 안내</Text>
            <Switch
              value={localSettings.tts}
              onValueChange={(value) => handleToggle('tts', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.tts ? '#FFFFFF' : theme.surface}
            />
          </View>
        </View>

        {/* 알림 시간 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>⏰ 알림 시간</Text>
          
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>오전 알림</Text>
            <TouchableOpacity
              style={[styles.smallButton, { marginTop: 10 }]}
              onPress={() => handleTimeChange('morningTime')}
              disabled={!localSettings.enabled}
              accessibilityLabel={`오전 알림 시간 변경 - 현재 ${localSettings.morningTime}`}
            >
              <Text style={styles.buttonText}>🌅 {localSettings.morningTime}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.bodyText}>저녁 알림</Text>
            <TouchableOpacity
              style={[styles.smallButton, { marginTop: 10 }]}
              onPress={() => handleTimeChange('eveningTime')}
              disabled={!localSettings.enabled}
              accessibilityLabel={`저녁 알림 시간 변경 - 현재 ${localSettings.eveningTime}`}
            >
              <Text style={styles.buttonText}>🌆 {localSettings.eveningTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 특별 알림 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>🎯 특별 알림</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bodyText}>마감일 알림</Text>
              <Text style={styles.secondaryText}>신청 마감 3일 전 알림</Text>
            </View>
            <Switch
              value={localSettings.deadlineReminder}
              onValueChange={(value) => handleToggle('deadlineReminder', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.deadlineReminder ? '#FFFFFF' : theme.surface}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bodyText}>주간 요약</Text>
              <Text style={styles.secondaryText}>매주 일요일 이번 주 사업 요약</Text>
            </View>
            <Switch
              value={localSettings.weeklyDigest}
              onValueChange={(value) => handleToggle('weeklyDigest', value)}
              disabled={!localSettings.enabled}
              trackColor={{ false: theme.disabled, true: theme.accent }}
              thumbColor={localSettings.weeklyDigest ? '#FFFFFF' : theme.surface}
            />
          </View>
        </View>

        {/* 테스트 버튼 */}
        <TouchableOpacity
          style={[styles.primaryButton, { marginBottom: 20 }]}
          onPress={handleTestNotification}
          disabled={!localSettings.enabled}
          accessibilityLabel="알림 테스트"
        >
          <Text style={styles.primaryButtonText}>🧪 알림 테스트</Text>
          <Text style={[styles.secondaryText, { color: '#FFFFFF', marginTop: 5 }]}>
            설정한 방식으로 테스트 알림 보내기
          </Text>
        </TouchableOpacity>

        {/* 도움말 */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>💡 알림 도움말</Text>
          <Text style={styles.secondaryText}>
            • 알림을 켜두시면 중요한 사업을 놓치지 않아요{'\n'}
            • 음성 안내는 시력이 불편하신 분들께 유용해요{'\n'}
            • 알림 시간은 여러 번 터치하여 변경할 수 있어요{'\n'}
            • 마감일 알림으로 신청을 미리 준비하세요
          </Text>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
