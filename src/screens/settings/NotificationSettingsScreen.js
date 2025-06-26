import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';

const NotificationSettingsScreen = ({ navigation }) => {
  const { theme, fontSize } = useTheme();
  const { settings, updateNotificationSettings } = useNotification();
  const styles = createStyles(theme, fontSize);

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = TTSService.getScreenWelcomeMessage('notificationSettings');
    await TTSService.speak(welcomeMessage);
  };

  const handleToggleNotifications = async (enabled) => {
    const newSettings = { ...localSettings, enabled };
    setLocalSettings(newSettings);
    
    const message = enabled ? '푸시알림을 켰습니다.' : '푸시알림을 껐습니다.';
    await TTSService.speak(message);
  };

  const handleTimeSelect = async (time) => {
    const newSettings = { ...localSettings, preferredTime: time };
    setLocalSettings(newSettings);
    
    const timeText = time === '08:00' ? '오전 8시' : 
                    time === '10:00' ? '오전 10시' :
                    time === '14:00' ? '오후 2시' :
                    time === '18:00' ? '저녁 6시' :
                    time === '20:00' ? '저녁 8시' : '밤 9시';
    
    await TTSService.speak(`알림 시간을 ${timeText}로 설정했습니다.`);
  };

  const handleVoiceGenderSelect = async (gender) => {
    const ttsSettings = await TTSService.getSettings();
    await TTSService.setVoiceGender(gender);
    
    const genderText = gender === 'male' ? '남성 목소리' : '여성 목소리';
    await TTSService.speak(`${genderText}로 변경되었습니다.`);
  };

  const handleSpeedSelect = async (speed) => {
    await TTSService.setSpeed(speed);
    await TTSService.speak(TTSService.getActionMessage('speedChanged'));
  };

  const handleSave = async () => {
    try {
      const success = await updateNotificationSettings(localSettings);
      
      if (success) {
        await TTSService.speak(TTSService.getActionMessage('settingsSaved'));
        Alert.alert('저장 완료', '알림 설정이 저장되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('설정 저장 실패');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      Alert.alert('오류', '설정 저장 중 오류가 발생했습니다.');
    }
  };

  const goBack = async () => {
    await TTSService.speak('이전 화면으로 돌아갑니다.');
    navigation.goBack();
  };

  const timeOptions = [
    { value: '08:00', label: '오전 8시' },
    { value: '10:00', label: '오전 10시' },
    { value: '14:00', label: '오후 2시' },
    { value: '18:00', label: '저녁 6시' },
    { value: '20:00', label: '저녁 8시' },
    { value: '21:00', label: '밤 9시' }
  ];

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

        {/* 푸시알림 켜기/끄기 */}
        <View style={styles.card}>
          <Text style={styles.subtitleText}>푸시알림 받기</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
            <TouchableOpacity
              style={[
                styles.smallButton,
                { flex: 0.45 },
                localSettings.enabled && { backgroundColor: theme.accent }
              ]}
              onPress={() => handleToggleNotifications(true)}
              accessibilityLabel="푸시알림 켜기"
            >
              <Text style={[
                styles.buttonText,
                localSettings.enabled && { color: '#FFFFFF' }
              ]}>
                🔔 켜기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.smallButton,
                { flex: 0.45 },
                !localSettings.enabled && { backgroundColor: theme.accent }
              ]}
              onPress={() => handleToggleNotifications(false)}
              accessibilityLabel="푸시알림 끄기"
            >
              <Text style={[
                styles.buttonText,
                !localSettings.enabled && { color: '#FFFFFF' }
              ]}>
                🔕 끄기
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 알림 선호시간 */}
        <View style={styles.card}>
          <Text style={styles.subtitleText}>알림 선호시간</Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginTop: 15 
          }}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.smallButton,
                  { width: '48%', marginBottom: 10 },
                  localSettings.preferredTime === option.value && { backgroundColor: theme.accent }
                ]}
                onPress={() => handleTimeSelect(option.value)}
                accessibilityLabel={`알림 시간 ${option.label} 선택`}
              >
                <Text style={[
                  styles.buttonText,
                  localSettings.preferredTime === option.value && { color: '#FFFFFF' }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 음성 안내 목소리 */}
        <View style={styles.card}>
          <Text style={styles.subtitleText}>음성 안내 목소리</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => handleVoiceGenderSelect('male')}
              accessibilityLabel="남성 목소리 선택"
            >
              <Text style={styles.buttonText}>👨 남성 목소리</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => handleVoiceGenderSelect('female')}
              accessibilityLabel="여성 목소리 선택"
            >
              <Text style={styles.buttonText}>👩 여성 목소리</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 음성 속도 */}
        <View style={styles.card}>
          <Text style={styles.subtitleText}>음성 속도</Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginTop: 15 
          }}>
            <TouchableOpacity
              style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
              onPress={() => handleSpeedSelect('very_slow')}
              accessibilityLabel="매우 느린 속도 선택"
            >
              <Text style={styles.buttonText}>🐌 매우 느림</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
              onPress={() => handleSpeedSelect('slow')}
              accessibilityLabel="느린 속도 선택"
            >
              <Text style={styles.buttonText}>🚶 느림</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
              onPress={() => handleSpeedSelect('normal')}
              accessibilityLabel="보통 속도 선택"
            >
              <Text style={styles.buttonText}>🚴 보통</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
              onPress={() => handleSpeedSelect('fast')}
              accessibilityLabel="빠른 속도 선택"
            >
              <Text style={styles.buttonText}>🏃 빠름</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 현재 설정 */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>현재 설정</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 알림: {localSettings.enabled ? '켜짐' : '꺼짐'}{'\n'}
              • 시간: {timeOptions.find(t => t.value === localSettings.preferredTime)?.label || '설정 안됨'}{'\n'}
              • 목소리: 설정된 음성{'\n'}
              • 속도: 설정된 속도
            </Text>
          </View>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 30 }]}
          onPress={handleSave}
          accessibilityLabel="설정 저장하기"
        >
          <Text style={styles.primaryButtonText}>💾 저장하기</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
