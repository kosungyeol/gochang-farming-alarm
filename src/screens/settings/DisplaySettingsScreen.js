import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { createStyles } from '../../styles/theme';
import TTSService from '../../services/tts/TTSService';

const DisplaySettingsScreen = ({ navigation }) => {
  const { 
    theme, 
    fontSize, 
    currentTheme, 
    setTheme, 
    setFontSize,
    getThemeName,
    getFontSizeName 
  } = useTheme();
  const { user } = useUser();
  const styles = createStyles(theme, fontSize);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // 화면 진입시 음성 안내
    const welcomeMessage = '화면 설정 화면입니다. 글자 크기와 화면 모드를 조정할 수 있어요.';
    await TTSService.speak(welcomeMessage);
  };

  const handleThemeChange = async () => {
    const themes = ['light', 'dark', 'highContrast'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    await setTheme(newTheme);
    
    const themeNames = {
      light: '밝은 모드',
      dark: '어두운 모드',
      highContrast: '고대비 모드'
    };
    
    await TTSService.speak(`${themeNames[newTheme]}로 변경되었습니다.`);
  };

  const handleFontSizeChange = async () => {
    const sizes = ['small', 'medium', 'large', 'extraLarge'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    
    await setFontSize(newSize);
    
    const sizeNames = {
      small: '작은 글자',
      medium: '보통 글자',
      large: '큰 글자',
      extraLarge: '매우 큰 글자'
    };
    
    await TTSService.speak(`${sizeNames[newSize]}로 변경되었습니다.`);
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
          
          <Text style={styles.titleText}>🎨 화면 설정</Text>
        </View>

        {/* 현재 설정 표시 */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <Text style={styles.subtitleText}>📱 현재 설정</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              • 화면 모드: {getThemeName()}{'\n'}
              • 글자 크기: {getFontSizeName()}
            </Text>
          </View>
        </View>

        {/* 화면 모드 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>🌙 화면 모드</Text>
          <Text style={styles.secondaryText}>현재: {getThemeName()}</Text>
          
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 15 }]}
            onPress={handleThemeChange}
            accessibilityLabel={`화면 모드 변경 - 현재 ${getThemeName()}`}
          >
            <Text style={styles.primaryButtonText}>🔄 모드 변경</Text>
            <Text style={[styles.secondaryText, { color: '#FFFFFF', marginTop: 5 }]}>
              밝은 모드 → 어두운 모드 → 고대비 모드
            </Text>
          </TouchableOpacity>
        </View>

        {/* 글자 크기 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>📏 글자 크기</Text>
          <Text style={styles.secondaryText}>현재: {getFontSizeName()}</Text>
          
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 15 }]}
            onPress={handleFontSizeChange}
            accessibilityLabel={`글자 크기 변경 - 현재 ${getFontSizeName()}`}
          >
            <Text style={styles.primaryButtonText}>📝 크기 변경</Text>
            <Text style={[styles.secondaryText, { color: '#FFFFFF', marginTop: 5 }]}>
              작게 → 보통 → 크게 → 매우 크게
            </Text>
          </TouchableOpacity>
        </View>

        {/* 미리보기 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>👁️ 미리보기</Text>
          <View style={{ marginTop: 15, padding: 15, backgroundColor: theme.surface, borderRadius: 8 }}>
            <Text style={styles.subtitleText}>농민수당</Text>
            <Text style={styles.bodyText}>
              고창군에 거주하는 농업인에게 매월 5만원을 지원하는 사업입니다.
            </Text>
            <Text style={styles.secondaryText}>
              신청기간: 2025-04-01 ~ 2025-04-30
            </Text>
          </View>
        </View>

        {/* 추천 설정 */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.subtitleText}>💡 추천 설정</Text>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.bodyText}>
              <Text style={{ fontWeight: 'bold' }}>60세 이상 분들께</Text>{'\n'}
              • 글자 크기: 큰 글자 또는 매우 큰 글자{'\n'}
              • 화면 모드: 고대비 모드 (더 선명함){'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>야간 사용시</Text>{'\n'}
              • 화면 모드: 어두운 모드 (눈의 피로 감소){'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>시력이 불편하신 분들께</Text>{'\n'}
              • 글자 크기: 매우 큰 글자{'\n'}
              • 화면 모드: 고대비 모드
            </Text>
          </View>
        </View>

        {/* 접근성 정보 */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={styles.subtitleText}>♿ 접근성 도움말</Text>
          <Text style={styles.secondaryText}>
            • 버튼을 터치하면 음성으로 안내해드려요{'\n'}
            • 설정 변경시 즉시 음성으로 확인해드려요{'\n'}
            • 고대비 모드는 저시력 분들께 도움이 됩니다{'\n'}
            • 큰 글자는 원시나 노안이 있으신 분들께 좋아요
          </Text>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DisplaySettingsScreen;
