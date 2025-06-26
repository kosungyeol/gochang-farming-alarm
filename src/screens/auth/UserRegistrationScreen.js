import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';

const UserRegistrationScreen = ({ navigation }) => {
  const { theme, fontSize } = useTheme();
  const { registerUser } = useUser();
  const styles = createStyles(theme, fontSize);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    industries: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 화면 진입시 음성 안내
    const welcomeMessage = TTSService.getScreenWelcomeMessage('userRegistration');
    TTSService.speak(welcomeMessage);
  }, []);

  const industryOptions = [
    { key: 'agriculture', label: '농업', emoji: '🌾' },
    { key: 'forestry', label: '임업', emoji: '🌲' },
    { key: 'livestock', label: '축산', emoji: '🐄' },
    { key: 'fishery', label: '수산', emoji: '🐟' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleGenderSelect = async (gender) => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
    
    const genderText = gender === 'male' ? '남성' : '여성';
    await TTSService.speak(`${genderText}을 선택하셨습니다.`);
  };

  const handleIndustryToggle = async (industryKey) => {
    const isSelected = formData.industries.includes(industryKey);
    let newIndustries;
    
    if (isSelected) {
      newIndustries = formData.industries.filter(key => key !== industryKey);
    } else {
      newIndustries = [...formData.industries, industryKey];
    }
    
    setFormData(prev => ({
      ...prev,
      industries: newIndustries
    }));
    
    const industry = industryOptions.find(opt => opt.key === industryKey);
    const action = isSelected ? '해제' : '선택';
    await TTSService.speak(`${industry.label} ${action}하셨습니다.`);
  };

  const validateForm = () => {
    const newErrors = {};

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    // 생년월일 검증 (YYMMDD 형식)
    if (!formData.birthDate.trim()) {
      newErrors.birthDate = '생년월일을 입력해주세요';
    } else if (!/^\d{6}$/.test(formData.birthDate)) {
      newErrors.birthDate = '6자리 숫자로 입력해주세요 (예: 650315)';
    }

    // 성별 검증
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    // 업종 검증
    if (formData.industries.length === 0) {
      newErrors.industries = '최소 1개 업종을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const errorMessage = Object.values(errors)[0];
      await TTSService.speak(`입력 오류: ${errorMessage}`);
      Alert.alert('입력 오류', errorMessage);
      return;
    }

    try {
      // 생년월일을 전체 형식으로 변환 (YY -> 19YY 또는 20YY)
      const year = parseInt(formData.birthDate.substring(0, 2));
      const fullYear = year > 30 ? 1900 + year : 2000 + year; // 30보다 크면 19xx, 작으면 20xx
      const month = formData.birthDate.substring(2, 4);
      const day = formData.birthDate.substring(4, 6);
      const fullBirthDate = `${fullYear}-${month}-${day}`;

      const userData = {
        name: formData.name.trim(),
        birthDate: fullBirthDate,
        gender: formData.gender,
        industries: formData.industries
      };

      const success = await registerUser(userData);
      
      if (success) {
        await TTSService.speak(`${formData.name}님, 가입이 완료되었습니다! 농업 알리미에 오신 것을 환영합니다.`);
        
        Alert.alert(
          '가입 완료',
          `${formData.name}님, 고창 농업 알리미 가입이 완료되었습니다!`,
          [
            {
              text: '시작하기',
              onPress: () => navigation.replace('Main')
            }
          ]
        );
      } else {
        throw new Error('사용자 등록 실패');
      }
      
    } catch (error) {
      console.error('가입 오류:', error);
      await TTSService.speak('가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      Alert.alert('오류', '가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={[styles.background, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 헤더 */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={styles.titleText}>🌾 농업 알리미 가입</Text>
          <Text style={styles.secondaryText}>고창군 농업인을 위한 보조사업 안내</Text>
        </View>

        {/* 이름 입력 */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subtitleText}>이름 또는 별칭</Text>
          <TextInput
            style={[
              styles.input,
              errors.name && { borderColor: theme.error, borderWidth: 2 }
            ]}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="예: 농업인, 홍길동"
            placeholderTextColor={theme.textSecondary}
            maxLength={20}
            accessibilityLabel="이름 또는 별칭 입력"
            accessibilityHint="사용하실 이름이나 별칭을 입력해주세요"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>

        {/* 생년월일 입력 */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subtitleText}>생년월일 (6자리)</Text>
          <TextInput
            style={[
              styles.input,
              errors.birthDate && { borderColor: theme.error, borderWidth: 2 }
            ]}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange('birthDate', value)}
            placeholder="예: 650315 (1965년 3월 15일)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={6}
            accessibilityLabel="생년월일 6자리 입력"
            accessibilityHint="년월일 6자리를 연속으로 입력해주세요"
          />
          {errors.birthDate && (
            <Text style={styles.errorText}>{errors.birthDate}</Text>
          )}
        </View>

        {/* 성별 선택 */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subtitleText}>성별</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <TouchableOpacity
              style={[
                styles.smallButton,
                { flex: 0.45 },
                formData.gender === 'male' && { backgroundColor: theme.accent }
              ]}
              onPress={() => handleGenderSelect('male')}
              accessibilityLabel="남성 선택"
              accessibilityState={{ selected: formData.gender === 'male' }}
            >
              <Text style={[
                styles.buttonText,
                formData.gender === 'male' && { color: '#FFFFFF' }
              ]}>
                👨 남성
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.smallButton,
                { flex: 0.45 },
                formData.gender === 'female' && { backgroundColor: theme.accent }
              ]}
              onPress={() => handleGenderSelect('female')}
              accessibilityLabel="여성 선택"
              accessibilityState={{ selected: formData.gender === 'female' }}
            >
              <Text style={[
                styles.buttonText,
                formData.gender === 'female' && { color: '#FFFFFF' }
              ]}>
                👩 여성
              </Text>
            </TouchableOpacity>
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>

        {/* 업종 선택 */}
        <View style={{ marginBottom: 30 }}>
          <Text style={styles.subtitleText}>업종 선택 (중복 가능)</Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginTop: 10 
          }}>
            {industryOptions.map((industry) => {
              const isSelected = formData.industries.includes(industry.key);
              return (
                <TouchableOpacity
                  key={industry.key}
                  style={[
                    styles.smallButton,
                    { width: '48%', marginBottom: 10 },
                    isSelected && { backgroundColor: theme.accent }
                  ]}
                  onPress={() => handleIndustryToggle(industry.key)}
                  accessibilityLabel={`${industry.label} ${isSelected ? '선택됨' : '선택 안됨'}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[
                    styles.buttonText,
                    isSelected && { color: '#FFFFFF' }
                  ]}>
                    {industry.emoji} {industry.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.industries && (
            <Text style={styles.errorText}>{errors.industries}</Text>
          )}
        </View>

        {/* 시작하기 버튼 */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          accessibilityLabel="가입 완료하고 시작하기"
          accessibilityHint="입력한 정보로 농업 알리미 가입을 완료합니다"
        >
          <Text style={styles.primaryButtonText}>✅ 시작하기</Text>
        </TouchableOpacity>

        {/* 도움말 */}
        <View style={{ marginTop: 20, padding: 15, backgroundColor: theme.surface, borderRadius: 10 }}>
          <Text style={styles.secondaryText}>
            📋 입력 도움말{'\n'}
            • 이름: 실명이나 편한 별칭 사용 가능{'\n'}
            • 생년월일: 년월일 6자리 (예: 650315){'\n'}
            • 업종: 관련된 모든 업종 선택 가능{'\n'}
            • 입력하신 정보는 안전하게 보관됩니다
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserRegistrationScreen;
