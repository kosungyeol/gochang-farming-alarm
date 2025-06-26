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
import { useUser } from '../../contexts/UserContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';
import { StorageService } from '../../services/storage/StorageService';

const MainScreen = ({ navigation }) => {
  const { theme, fontSize } = useTheme();
  const { user, userName } = useUser();
  const styles = createStyles(theme, fontSize);

  const [notifications, setNotifications] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = TTSService.getScreenWelcomeMessage('main', userName);
    await TTSService.speak(welcomeMessage);
    
    // 알림 데이터 로드
    await loadNotifications();
    
    // 앱 사용 통계 기록
    await StorageService.recordAppUsage('main_screen_visit', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const loadNotifications = async () => {
    try {
      const notificationHistory = await StorageService.getNotificationHistory(10);
      setNotifications(notificationHistory);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  const handleNewNotifications = async () => {
    await TTSService.speak('새로운 알림을 확인하러 갑니다.');
    
    if (notifications.length > 0) {
      // 가장 최근 알림으로 이동
      const latestNotification = notifications[0];
      navigation.navigate('Notification', { 
        notification: latestNotification 
      });
    } else {
      await TTSService.speak('현재 새로운 알림이 없습니다.');
      Alert.alert('알림', '현재 새로운 알림이 없습니다.');
    }
  };

  const handleMonthlyProjects = async () => {
    await TTSService.speak(`${currentMonth}월 사업 목록을 보러 갑니다.`);
    navigation.navigate('Projects', { month: currentMonth });
  };

  const handleMyInterests = async () => {
    await TTSService.speak('내가 관심 등록한 사업들을 보러 갑니다.');
    
    try {
      const interests = await StorageService.getUserInterests();
      navigation.navigate('Projects', { 
        showInterestsOnly: true,
        interests 
      });
    } catch (error) {
      console.error('관심사업 로드 오류:', error);
      await TTSService.speak('관심사업을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSettings = async () => {
    await TTSService.speak('설정 화면으로 이동합니다.');
    navigation.navigate('Settings');
  };

  const getMonthName = (month) => {
    const months = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return months[month - 1];
  };

  const getNotificationBadgeText = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return '알림 없음';
    return `새 알림 ${unreadCount}개`;
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 6) {
      greeting = '새벽';
    } else if (hour < 12) {
      greeting = '좋은 아침';
    } else if (hour < 18) {
      greeting = '안녕하세요';
    } else {
      greeting = '안녕하세요';
    }
    
    return `${greeting}! ${userName}님`;
  };

  return (
    <SafeAreaView style={[styles.background, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 헤더 */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={styles.titleText}>🌾 농업 알리미</Text>
          <Text style={styles.bodyText}>{getGreetingMessage()}</Text>
          <Text style={styles.secondaryText}>고창군 농업 보조사업 안내</Text>
        </View>

        {/* 새 알림 카드 */}
        <TouchableOpacity
          style={[
            styles.card,
            { 
              backgroundColor: notifications.filter(n => !n.isRead).length > 0 
                ? theme.accentLight 
                : theme.card 
            }
          ]}
          onPress={handleNewNotifications}
          accessibilityLabel={`새로운 알림 확인하기, ${getNotificationBadgeText()}`}
          accessibilityHint="터치하면 새로운 알림을 확인할 수 있습니다"
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={[
              styles.subtitleText,
              { 
                color: notifications.filter(n => !n.isRead).length > 0 
                  ? '#FFFFFF' 
                  : theme.primary 
              }
            ]}>
              🔔 {getNotificationBadgeText()}
            </Text>
            <Text style={[
              styles.bodyText,
              { 
                marginTop: 8,
                color: notifications.filter(n => !n.isRead).length > 0 
                  ? '#FFFFFF' 
                  : theme.text 
              }
            ]}>
              터치해서 확인하기
            </Text>
          </View>
        </TouchableOpacity>

        {/* 이달의 사업 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleMonthlyProjects}
          accessibilityLabel={`이달의 사업 보기, ${getMonthName(currentMonth)} 사업들`}
          accessibilityHint="터치하면 이번 달에 신청할 수 있는 사업을 볼 수 있습니다"
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.subtitleText}>
              📅 이달의 사업
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              {getMonthName(currentMonth)} 신청 사업 보기
            </Text>
          </View>
        </TouchableOpacity>

        {/* 내 관심사업 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleMyInterests}
          accessibilityLabel="내 관심사업 관리하기"
          accessibilityHint="터치하면 내가 관심 등록한 사업들을 관리할 수 있습니다"
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.subtitleText}>
              ⭐ 내 관심사업
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              등록한 사업 관리
            </Text>
          </View>
        </TouchableOpacity>

        {/* 설정 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleSettings}
          accessibilityLabel="설정 화면으로 이동"
          accessibilityHint="터치하면 개인정보, 알림설정, 화면설정을 변경할 수 있습니다"
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.subtitleText}>
              ⚙️ 설정
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              개인정보 및 앱 설정
            </Text>
          </View>
        </TouchableOpacity>

        {/* 빠른 정보 */}
        <View style={[styles.card, { marginTop: 30 }]}>
          <Text style={styles.subtitleText}>📊 오늘의 정보</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 현재 시간: {new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            <Text style={styles.bodyText}>
              • 등록된 관심사업: {notifications.length}개
            </Text>
            <Text style={styles.bodyText}>
              • 이번 달: {getMonthName(currentMonth)}
            </Text>
          </View>
        </View>

        {/* 고창군 정보 */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.subtitleText}>🏛️ 고창군청 농업과</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 전화: 063-560-2000
            </Text>
            <Text style={styles.bodyText}>
              • 주소: 전북 고창군 고창읍 중앙로 200
            </Text>
            <Text style={styles.bodyText}>
              • 업무시간: 평일 09:00 ~ 18:00
            </Text>
          </View>
        </View>

        {/* 도움말 */}
        <View style={[styles.card, { marginTop: 20, backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>💡 사용 도움말</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.secondaryText}>
              🔊 화면의 모든 내용은 음성으로 안내됩니다{'\n'}
              📱 큰 버튼으로 터치하기 쉽게 만들었습니다{'\n'}
              🔔 관심사업 알림을 놓치지 마세요{'\n'}
              ⚙️ 설정에서 글자 크기와 음성을 조절할 수 있습니다
            </Text>
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;
