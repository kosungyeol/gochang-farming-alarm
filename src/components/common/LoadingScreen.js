import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme';

const LoadingScreen = ({ message = '로딩 중...' }) => {
  const { theme, fontSize } = useTheme();
  const styles = createStyles(theme, fontSize);

  return (
    <View style={[
      styles.centerContainer,
      styles.background
    ]}>
      {/* 로딩 아이콘 */}
      <ActivityIndicator 
        size="large" 
        color={theme.accent} 
        style={{ marginBottom: 20 }}
      />
      
      {/* 앱 로고 */}
      <Text style={[styles.titleText, { marginBottom: 10 }]}>
        🌾 농업 알리미
      </Text>
      
      {/* 로딩 메시지 */}
      <Text style={styles.bodyText}>
        {message}
      </Text>
      
      {/* 로딩 상태 설명 */}
      <Text style={[styles.secondaryText, { marginTop: 20, textAlign: 'center' }]}>
        고창군 농업인을 위한{'\n'}
        보조사업 안내 서비스
      </Text>
    </View>
  );
};

export default LoadingScreen;
