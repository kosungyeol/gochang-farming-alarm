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
import { useNotification } from '../../contexts/NotificationContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';
import { StorageService } from '../../services/storage/StorageService';

const NotificationScreen = ({ navigation, route }) => {
  const { theme, fontSize } = useTheme();
  const { user } = useUser();
  const { markNotificationAsRead } = useNotification();
  const styles = createStyles(theme, fontSize);

  const [project, setProject] = useState(route?.params?.project || null);
  const [notification, setNotification] = useState(route?.params?.notification || null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = TTSService.getScreenWelcomeMessage('notification');
    await TTSService.speak(welcomeMessage);
    
    // 알림을 읽음으로 표시
    if (notification?.id) {
      await markNotificationAsRead(notification.id);
    }

    // 앱 사용 통계 기록
    await StorageService.recordAppUsage('notification_detail_view', {
      userId: user?.id,
      projectId: project?.id,
      notificationId: notification?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleListenDetail = async () => {
    try {
      setIsPlaying(true);
      await TTSService.speak(TTSService.getActionMessage('listenDetail', project?.name || '알림'));
      
      // 상세 내용 음성 안내
      const detailScript = project?.ttsScript || notification?.content || '상세 내용을 준비 중입니다.';
      await TTSService.speak(detailScript);
      
    } catch (error) {
      console.error('음성 안내 오류:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleRemindTomorrow = async () => {
    try {
      await TTSService.speak(TTSService.getActionMessage('remindTomorrow'));
      
      // 내일 같은 시간에 알림 예약 (실제 구현시 스케줄링 로직 추가)
      await StorageService.recordAppUsage('remind_tomorrow', {
        projectId: project?.id,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      
      Alert.alert('알림 예약', '내일 같은 시간에 다시 알려드리겠습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('내일 알림 예약 오류:', error);
    }
  };

  const handleAlreadyKnow = async () => {
    try {
      await TTSService.speak(TTSService.getActionMessage('alreadyKnow'));
      
      await StorageService.recordAppUsage('already_know', {
        projectId: project?.id,
        timestamp: new Date().toISOString()
      });
      
      navigation.goBack();
      
    } catch (error) {
      console.error('알고있음 처리 오류:', error);
    }
  };

  const handleRemindNextYear = async () => {
    try {
      await TTSService.speak(TTSService.getActionMessage('remindNextYear'));
      
      // 내년 알림 예약 (실제 구현시 연간 스케줄링 로직 추가)
      await StorageService.recordAppUsage('remind_next_year', {
        projectId: project?.id,
        scheduledFor: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString()
      });
      
      Alert.alert('내년 알림', '내년에 같은 사업이 있을 때 다시 안내해드리겠습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('내년 알림 예약 오류:', error);
    }
  };

  const handleRemoveInterest = async () => {
    try {
      if (project?.id) {
        await StorageService.removeUserInterest(project.id);
        await TTSService.speak(TTSService.getActionMessage('removeInterest', project.name));
        
        Alert.alert('관심해제', `${project.name} 사업의 알림을 해제했습니다.`, [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('관심해제 오류:', error);
    }
  };

  const goBack = async () => {
    await TTSService.speak('이전 화면으로 돌아갑니다.');
    navigation.goBack();
  };

  // 프로젝트 또는 알림 데이터 확인
  const displayData = project || {
    name: notification?.title || '알림',
    target: '해당 없음',
    support1: notification?.content || '내용 없음',
    support2: '',
    location: '읍면사무소',
    startDate: notification?.timestamp ? new Date(notification.timestamp).toLocaleDateString() : '',
    endDate: '',
    ttsScript: notification?.content || ''
  };

  return (
    <SafeAreaView style={[styles.background, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 헤더 */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={styles.titleText}>{displayData.name}</Text>
          <Text style={styles.secondaryText}>농업 보조사업 안내</Text>
        </View>

        {/* 빠른 응답 버튼들 */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between',
          marginBottom: 30 
        }}>
          <TouchableOpacity
            style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
            onPress={handleRemindTomorrow}
            accessibilityLabel="내일 다시 알림"
          >
            <Text style={styles.buttonText}>📅 내일다시</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
            onPress={handleAlreadyKnow}
            accessibilityLabel="이미 알고 있음"
          >
            <Text style={styles.buttonText}>✅ 알고있음</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
            onPress={handleRemindNextYear}
            accessibilityLabel="내년에 안내"
          >
            <Text style={styles.buttonText}>📆 내년안내</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { width: '48%', marginBottom: 10 }]}
            onPress={handleRemoveInterest}
            accessibilityLabel="관심사업에서 제거"
          >
            <Text style={styles.buttonText}>❌ 관심해제</Text>
          </TouchableOpacity>
        </View>

        {/* 음성 안내 버튼 */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: isPlaying ? theme.warning : theme.accent }
          ]}
          onPress={handleListenDetail}
          disabled={isPlaying}
          accessibilityLabel="음성으로 상세 내용 듣기"
        >
          <Text style={styles.primaryButtonText}>
            🔊 {isPlaying ? '재생 중...' : '들어보기'}
          </Text>
          <Text style={[styles.secondaryText, { color: '#FFFFFF', marginTop: 5 }]}>
            터치하면 음성안내
          </Text>
        </TouchableOpacity>

        {/* 상세 정보 */}
        <View style={[styles.card, { marginTop: 30 }]}>
          <Text style={styles.subtitleText}>📋 사업 정보</Text>
          
          {displayData.startDate && displayData.endDate && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold' }}>신청기간</Text>{'\n'}
                {displayData.startDate} ~ {displayData.endDate}
              </Text>
            </View>
          )}

          {displayData.support1 && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold' }}>지원내용</Text>{'\n'}
                {displayData.support1}
                {displayData.support2 && `, ${displayData.support2}`}
              </Text>
            </View>
          )}

          {displayData.target && displayData.target !== '해당 없음' && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold' }}>사업대상</Text>{'\n'}
                {displayData.target}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              <Text style={{ fontWeight: 'bold' }}>신청방법</Text>{'\n'}
              {displayData.location} 방문 신청
            </Text>
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              <Text style={{ fontWeight: 'bold' }}>유의사항</Text>{'\n'}
              • 신청 기간을 꼭 확인하세요{'\n'}
              • 필요 서류를 미리 준비하세요{'\n'}
              • 중복 신청이 불가할 수 있습니다{'\n'}
              • 자세한 사항은 담당자에게 문의하세요
            </Text>
          </View>
        </View>

        {/* 문의처 */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.subtitleText}>📞 문의처</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 고창군청 농업과: 063-560-2000{'\n'}
              • 해당 읍면사무소 농업담당자{'\n'}
              • 농업기술센터: 063-560-2900
            </Text>
          </View>
        </View>

        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 30 }]}
          onPress={goBack}
          accessibilityLabel="이전 화면으로 돌아가기"
        >
          <Text style={styles.buttonText}>← 돌아가기</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
