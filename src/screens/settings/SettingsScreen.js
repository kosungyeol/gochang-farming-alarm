import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';
import { StorageService } from '../../services/storage/StorageService';

const SettingsScreen = ({ navigation }) => {
  const { theme, fontSize, currentTheme, getThemeName, getFontSizeName } = useTheme();
  const { user, userName, getUserAge, getIndustryNames, logout } = useUser();
  const styles = createStyles(theme, fontSize);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = TTSService.getScreenWelcomeMessage('settings');
    await TTSService.speak(welcomeMessage);
    
    // 앱 사용 통계 기록
    await StorageService.recordAppUsage('settings_screen_visit', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handlePersonalInfo = async () => {
    await TTSService.speak('개인정보 수정 화면으로 이동합니다.');
    navigation.navigate('ProfileEdit');
  };

  const handleInterestManagement = async () => {
    await TTSService.speak('관심사업 관리 화면으로 이동합니다.');
    navigation.navigate('Projects', { showInterestsOnly: true });
  };

  const handleNotificationSettings = async () => {
    await TTSService.speak('알림 설정 화면으로 이동합니다.');
    navigation.navigate('NotificationSettings');
  };

  const handleDisplaySettings = async () => {
    await TTSService.speak('화면 설정 화면으로 이동합니다.');
    navigation.navigate('DisplaySettings');
  };

  const handleAppInfo = async () => {
    await TTSService.speak('앱 정보를 확인합니다.');
    
    Alert.alert(
      '앱 정보',
      `고창 농업 알리미\n버전: 1.0.0\n개발: 고창군청 농업과\n\n고창군 농업인을 위한 보조사업 안내 및 알림 서비스입니다.`,
      [{ text: '확인' }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?\n다시 로그인하려면 개인정보를 다시 입력해야 합니다.',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await TTSService.speak('로그아웃합니다. 이용해주셔서 감사합니다.');
              await logout();
              navigation.replace('UserRegistration');
            } catch (error) {
              console.error('로그아웃 오류:', error);
            }
          }
        }
      ]
    );
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
          
          <Text style={styles.titleText}>⚙️ 설정</Text>
        </View>

        {/* 사용자 정보 요약 */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <Text style={styles.subtitleText}>👤 사용자 정보</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 이름: {userName || '미설정'}{'\n'}
              • 나이: {getUserAge() || '미설정'}세{'\n'}
              • 관심분야: {getIndustryNames() || '미설정'}{'\n'}
              • 화면모드: {getThemeName()}{'\n'}
              • 글자크기: {getFontSizeName()}
            </Text>
          </View>
        </View>

        {/* 개인정보 관리 */}
        <TouchableOpacity
          style={[styles.card, { marginBottom: 15 }]}
          onPress={handlePersonalInfo}
          accessibilityLabel="개인정보 수정"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.subtitleText}>📝 개인정보 수정</Text>
              <Text style={styles.secondaryText}>이름, 나이, 관심분야 변경</Text>
            </View>
            <Text style={styles.subtitleText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 관심사업 관리 */}
        <TouchableOpacity
          style={[styles.card, { marginBottom: 15 }]}
          onPress={handleInterestManagement}
          accessibilityLabel="관심사업 관리"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.subtitleText}>⭐ 관심사업 관리</Text>
              <Text style={styles.secondaryText}>등록된 관심사업 확인 및 관리</Text>
            </View>
            <Text style={styles.subtitleText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 알림 설정 */}
        <TouchableOpacity
          style={[styles.card, { marginBottom: 15 }]}
          onPress={handleNotificationSettings}
          accessibilityLabel="알림 설정"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.subtitleText}>🔔 알림 설정</Text>
              <Text style={styles.secondaryText}>알림 시간, 방식 설정</Text>
            </View>
            <Text style={styles.subtitleText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 화면 설정 */}
        <TouchableOpacity
          style={[styles.card, { marginBottom: 15 }]}
          onPress={handleDisplaySettings}
          accessibilityLabel="화면 설정"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.subtitleText}>🎨 화면 설정</Text>
              <Text style={styles.secondaryText}>글자크기, 화면모드 변경</Text>
            </View>
            <Text style={styles.subtitleText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 앱 정보 */}
        <TouchableOpacity
          style={[styles.card, { marginBottom: 15 }]}
          onPress={handleAppInfo}
          accessibilityLabel="앱 정보"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.subtitleText}>ℹ️ 앱 정보</Text>
              <Text style={styles.secondaryText}>버전, 개발자 정보</Text>
            </View>
            <Text style={styles.subtitleText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 도움말 */}
        <View style={[styles.card, { marginTop: 30, backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>💡 사용 도움말</Text>
          <Text style={styles.secondaryText}>
            • 개인정보를 정확히 입력하면 맞춤 알림을 받을 수 있어요{'\n'}
            • 관심사업을 등록하면 신청 마감일을 미리 알려드려요{'\n'}
            • 화면이 잘 안 보이면 글자크기를 조정해보세요{'\n'}
            • 야간에는 어두운 모드를 사용해보세요
          </Text>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={[styles.secondaryButton, { 
            marginTop: 40,
            backgroundColor: theme.error,
            borderColor: theme.error
          }]}
          onPress={handleLogout}
          accessibilityLabel="로그아웃"
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>🚪 로그아웃</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
