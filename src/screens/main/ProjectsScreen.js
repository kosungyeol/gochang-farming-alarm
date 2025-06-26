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

const ProjectsScreen = ({ navigation, route }) => {
  const { theme, fontSize } = useTheme();
  const { user } = useUser();
  const styles = createStyles(theme, fontSize);

  const [currentMonth, setCurrentMonth] = useState(route?.params?.month || new Date().getMonth() + 1);
  const [projects, setProjects] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [showInterestsOnly, setShowInterestsOnly] = useState(route?.params?.showInterestsOnly || false);

  useEffect(() => {
    initializeScreen();
  }, [currentMonth]);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = showInterestsOnly 
      ? '내 관심사업 관리 화면입니다. 등록하신 관심사업들을 확인하고 관리할 수 있어요.'
      : TTSService.getScreenWelcomeMessage('projects');
    await TTSService.speak(welcomeMessage);
    
    // 데이터 로드
    await loadProjects();
    await loadUserInterests();
  };

  const loadProjects = async () => {
    try {
      // 실제로는 API에서 가져올 데이터, 지금은 목업 데이터
      const mockProjects = [
        {
          id: 'project_1',
          name: '농민수당',
          shortName: '농민수당',
          month: 4,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          target: '고창군 거주 농업인',
          support1: '매월 5만원',
          support2: '연간 60만원',
          location: '읍면사무소',
          ttsScript: '농민수당 사업입니다. 고창군에 거주하는 농업인에게 매월 5만원, 연간 60만원을 지원해드립니다.',
          isActive: true
        },
        {
          id: 'project_2',
          name: '기본형공익직불제',
          shortName: '공익직불',
          month: 3,
          startDate: '2025-03-01',
          endDate: '2025-03-31',
          target: '농업경영체',
          support1: '면적당 지원',
          support2: '최대 200만원',
          location: '읍면사무소',
          ttsScript: '기본형 공익직불제 사업입니다. 농업경영체를 대상으로 면적에 따라 최대 200만원까지 지원해드립니다.',
          isActive: true
        },
        {
          id: 'project_3',
          name: '고추종자지원',
          shortName: '고추종자',
          month: currentMonth,
          startDate: `2025-${currentMonth.toString().padStart(2, '0')}-01`,
          endDate: `2025-${currentMonth.toString().padStart(2, '0')}-28`,
          target: '고추재배농가',
          support1: '종자비지원',
          support2: '최대5만원',
          location: '읍면사무소',
          ttsScript: '고추종자지원 사업입니다. 고추를 재배하시는 농가에 우량 종자비를 최대 5만원까지 지원해드립니다.',
          isActive: true
        }
      ];

      // 현재 월에 해당하는 프로젝트들만 필터링
      const filteredProjects = showInterestsOnly 
        ? mockProjects.filter(project => userInterests.includes(project.id))
        : mockProjects.filter(project => project.month === currentMonth);

      setProjects(filteredProjects);
    } catch (error) {
      console.error('프로젝트 로드 오류:', error);
    }
  };

  const loadUserInterests = async () => {
    try {
      const interests = await StorageService.getUserInterests();
      setUserInterests(interests);
    } catch (error) {
      console.error('관심사업 로드 오류:', error);
    }
  };

  const handleProjectInterest = async (projectId) => {
    try {
      const isInterested = userInterests.includes(projectId);
      const project = projects.find(p => p.id === projectId);
      
      if (isInterested) {
        // 관심사업에서 제거
        await StorageService.removeUserInterest(projectId);
        setUserInterests(prev => prev.filter(id => id !== projectId));
        await TTSService.speak(TTSService.getActionMessage('removeInterest', project.name));
      } else {
        // 관심사업으로 추가
        await StorageService.addUserInterest(projectId);
        setUserInterests(prev => [...prev, projectId]);
        await TTSService.speak(TTSService.getActionMessage('registerInterest', project.name));
      }
    } catch (error) {
      console.error('관심사업 처리 오류:', error);
    }
  };

  const handleProjectDetail = async (project) => {
    await TTSService.speak(TTSService.getActionMessage('listenDetail', project.name));
    navigation.navigate('Notification', { project });
  };

  const handleMonthChange = async (direction) => {
    const newMonth = direction === 'prev' 
      ? (currentMonth === 1 ? 12 : currentMonth - 1)
      : (currentMonth === 12 ? 1 : currentMonth + 1);
    
    setCurrentMonth(newMonth);
    await TTSService.speak(`${newMonth}월로 이동합니다.`);
  };

  const getMonthName = (month) => {
    return `${month}월`;
  };

  const goBack = async () => {
    await TTSService.speak('이전 화면으로 돌아갑니다.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.background, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            style={[styles.smallButton, { marginRight: 15 }]}
            onPress={goBack}
            accessibilityLabel="뒤로 가기"
          >
            <Text style={styles.buttonText}>← 뒤로</Text>
          </TouchableOpacity>
          
          <Text style={styles.titleText}>
            {showInterestsOnly ? '⭐ 내 관심사업' : `📅 ${getMonthName(currentMonth)} 사업들`}
          </Text>
        </View>

        {/* 월 네비게이션 (관심사업 보기가 아닌 경우만) */}
        {!showInterestsOnly && (
          <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 20 }]}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => handleMonthChange('prev')}
              accessibilityLabel={`${currentMonth === 1 ? 12 : currentMonth - 1}월로 이동`}
            >
              <Text style={styles.buttonText}>
                ← {getMonthName(currentMonth === 1 ? 12 : currentMonth - 1)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.subtitleText}>{getMonthName(currentMonth)}</Text>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => handleMonthChange('next')}
              accessibilityLabel={`${currentMonth === 12 ? 1 : currentMonth + 1}월로 이동`}
            >
              <Text style={styles.buttonText}>
                {getMonthName(currentMonth === 12 ? 1 : currentMonth + 1)} →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 프로젝트 목록 */}
        {projects.length > 0 ? (
          projects.map((project) => {
            const isInterested = userInterests.includes(project.id);
            return (
              <View key={project.id} style={[styles.card, { marginBottom: 15 }]}>
                <Text style={styles.subtitleText}>{project.name}</Text>
                
                <View style={{ marginTop: 10, marginBottom: 15 }}>
                  <Text style={styles.bodyText}>• 대상: {project.target}</Text>
                  <Text style={styles.bodyText}>• 지원: {project.support1}</Text>
                  <Text style={styles.bodyText}>• 금액: {project.support2}</Text>
                  <Text style={styles.bodyText}>• 신청: {project.location}</Text>
                  <Text style={styles.secondaryText}>
                    기간: {project.startDate} ~ {project.endDate}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={[
                      styles.smallButton,
                      { flex: 0.45 },
                      isInterested && { backgroundColor: theme.accent }
                    ]}
                    onPress={() => handleProjectInterest(project.id)}
                    accessibilityLabel={`${project.name} ${isInterested ? '관심해제' : '관심등록'}`}
                  >
                    <Text style={[
                      styles.buttonText,
                      isInterested && { color: '#FFFFFF' }
                    ]}>
                      {isInterested ? '⭐ 관심해제' : '☆ 관심등록'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.smallButton, { flex: 0.45 }]}
                    onPress={() => handleProjectDetail(project)}
                    accessibilityLabel={`${project.name} 상세내용 보기`}
                  >
                    <Text style={styles.buttonText}>🔊 자세히</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.card}>
            <Text style={styles.subtitleText}>
              {showInterestsOnly ? '등록된 관심사업이 없습니다' : `${getMonthName(currentMonth)}에 신청할 수 있는 사업이 없습니다`}
            </Text>
            <Text style={styles.bodyText}>
              {showInterestsOnly 
                ? '다른 월의 사업들을 확인하여 관심사업으로 등록해보세요.'
                : '다른 월을 확인해보시거나 나중에 다시 방문해주세요.'
              }
            </Text>
          </View>
        )}

        {/* 도움말 */}
        <View style={[styles.card, { marginTop: 30, backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>💡 사용 도움말</Text>
          <Text style={styles.secondaryText}>
            ⭐ 관심등록하면 신청 마감일 알림을 받을 수 있어요{'\n'}
            🔊 자세히 버튼을 누르면 음성으로 상세한 안내를 들을 수 있어요{'\n'}
            📅 월 버튼으로 다른 달 사업도 확인해보세요
          </Text>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectsScreen;
