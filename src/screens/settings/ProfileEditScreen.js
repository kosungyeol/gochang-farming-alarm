import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';
import { StorageService } from '../../services/storage/StorageService';

const ProfileEditScreen = ({ navigation }) => {
  const { theme, fontSize } = useTheme();
  const { user, updateUser, userName, getUserAge, getIndustryNames } = useUser();
  const styles = createStyles(theme, fontSize);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    industries: [],
    location: '고창군'
  });

  const [isEditing, setIsEditing] = useState(false);

  const industryOptions = [
    { id: 'rice', name: '벼농사', icon: '🌾' },
    { id: 'vegetable', name: '채소', icon: '🥬' },
    { id: 'fruit', name: '과수', icon: '🍎' },
    { id: 'livestock', name: '축산', icon: '🐄' },
    { id: 'flower', name: '화훼', icon: '🌸' },
    { id: 'special', name: '특작', icon: '🌿' }
  ];

  useEffect(() => {
    initializeScreen();
    loadUserData();
  }, []);

  const initializeScreen = async () => {
    const welcomeMessage = '개인정보 수정 화면입니다. 이름, 나이, 관심분야를 변경할 수 있어요.';
    await TTSService.speak(welcomeMessage);
  };

  const loadUserData = () => {
    setFormData({
      name: userName || '',
      age: getUserAge()?.toString() || '',
      industries: user?.industries || [],
      location: user?.location || '고창군'
    });
  };

  const handleIndustryToggle = async (industryId) => {
    const industry = industryOptions.find(i => i.id === industryId);
    const isSelected = formData.industries.includes(industryId);
    
    let newIndustries;
    if (isSelected) {
      newIndustries = formData.industries.filter(id => id !== industryId);
      await TTSService.speak(`${industry.name} 관심분야에서 제거되었습니다.`);
    } else {
      newIndustries = [...formData.industries, industryId];
      await TTSService.speak(`${industry.name} 관심분야로 추가되었습니다.`);
    }
    
    setFormData(prev => ({
      ...prev,
      industries: newIndustries
    }));
  };

  const handleSave = async () => {
    try {
      // 입력 유효성 검사
      if (!formData.name.trim()) {
        Alert.alert('입력 오류', '이름을 입력해주세요.');
        return;
      }
      
      if (!formData.age || isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
        Alert.alert('입력 오류', '올바른 나이를 입력해주세요.');
        return;
      }
      
      if (formData.industries.length === 0) {
        Alert.alert('입력 오류', '최소 하나의 관심분야를 선택해주세요.');
        return;
      }

      // 사용자 정보 업데이트
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        industries: formData.industries,
        location: formData.location,
        updatedAt: new Date().toISOString()
      };

      await updateUser(updatedUser);
      await TTSService.speak('개인정보가 성공적으로 수정되었습니다.');
      
      setIsEditing(false);
      
      Alert.alert('저장 완료', '개인정보가 성공적으로 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('사용자 정보 저장 오류:', error);
      Alert.alert('저장 실패', '정보 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = async () => {
    await TTSService.speak('수정을 취소합니다.');
    loadUserData(); // 원래 데이터로 복원
    setIsEditing(false);
  };

  const startEditing = async () => {
    await TTSService.speak('편집 모드로 전환합니다.');
    setIsEditing(true);
  };

  const goBack = async () => {
    if (isEditing) {
      Alert.alert(
        '편집 중단',
        '편집 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?',
        [
          { text: '계속 편집', style: 'cancel' },
          { 
            text: '나가기', 
            style: 'destructive',
            onPress: async () => {
              await TTSService.speak('이전 화면으로 돌아갑니다.');
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      await TTSService.speak('이전 화면으로 돌아갑니다.');
      navigation.goBack();
    }
  };

  const getSelectedIndustryNames = () => {
    return formData.industries
      .map(id => industryOptions.find(option => option.id === id)?.name)
      .filter(Boolean)
      .join(', ');
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
          
          <Text style={styles.titleText}>📝 개인정보 수정</Text>
        </View>

        {/* 현재 정보 표시 (편집 모드가 아닐 때) */}
        {!isEditing && (
          <View style={[styles.card, { marginBottom: 20 }]}>
            <Text style={styles.subtitleText}>👤 현재 정보</Text>
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bodyText}>
                • 이름: {formData.name || '미설정'}{' \n'}
                • 나이: {formData.age || '미설정'}세{' \n'}
                • 관심분야: {getSelectedIndustryNames() || '미설정'}{' \n'}
                • 지역: {formData.location}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 20 }]}
              onPress={startEditing}
              accessibilityLabel="정보 수정하기"
            >
              <Text style={styles.primaryButtonText}>✏️ 수정하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 편집 폼 (편집 모드일 때) */}
        {isEditing && (
          <>
            {/* 이름 입력 */}
            <View style={[styles.card, { marginBottom: 20 }]}>
              <Text style={styles.subtitleText}>👤 이름</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    marginTop: 10,
                    padding: 15,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    backgroundColor: theme.surface
                  }
                ]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="이름을 입력하세요"
                placeholderTextColor={theme.placeholder}
                accessibilityLabel="이름 입력"
              />
            </View>

            {/* 나이 입력 */}
            <View style={[styles.card, { marginBottom: 20 }]}>
              <Text style={styles.subtitleText}>🎂 나이</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    marginTop: 10,
                    padding: 15,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    backgroundColor: theme.surface
                  }
                ]}
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                placeholder="나이를 입력하세요"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
                accessibilityLabel="나이 입력"
              />
            </View>

            {/* 관심분야 선택 */}
            <View style={[styles.card, { marginBottom: 20 }]}>
              <Text style={styles.subtitleText}>🌾 관심분야</Text>
              <Text style={styles.secondaryText}>관련 있는 분야를 모두 선택하세요</Text>
              
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                marginTop: 15 
              }}>
                {industryOptions.map((industry) => {
                  const isSelected = formData.industries.includes(industry.id);
                  return (
                    <TouchableOpacity
                      key={industry.id}
                      style={[
                        styles.smallButton,
                        {
                          margin: 5,
                          backgroundColor: isSelected ? theme.accent : theme.surface,
                          borderColor: isSelected ? theme.accent : theme.border,
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => handleIndustryToggle(industry.id)}
                      accessibilityLabel={`${industry.name} ${isSelected ? '선택됨' : '선택 안됨'}`}
                    >
                      <Text style={[
                        styles.buttonText,
                        { color: isSelected ? '#FFFFFF' : theme.text }
                      ]}>
                        {industry.icon} {industry.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 저장/취소 버튼 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 0.45 }]}
                onPress={handleCancel}
                accessibilityLabel="수정 취소"
              >
                <Text style={styles.buttonText}>❌ 취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 0.45 }]}
                onPress={handleSave}
                accessibilityLabel="정보 저장"
              >
                <Text style={styles.primaryButtonText}>✅ 저장</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 도움말 */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>💡 개인정보 활용</Text>
          <Text style={styles.secondaryText}>
            • 이름: 개인화된 인사말에 사용됩니다{' \n'}
            • 나이: 연령대별 맞춤 정보 제공에 활용됩니다{' \n'}
            • 관심분야: 해당 분야 사업 우선 알림에 사용됩니다{' \n'}
            • 모든 정보는 앱 내에서만 사용되며 외부로 전송되지 않습니다
          </Text>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileEditScreen;