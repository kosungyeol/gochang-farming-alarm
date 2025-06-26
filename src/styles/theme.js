// 고창 농업 알리미 - 테마 시스템
// 설계 문서에 따른 한지 느낌 디자인과 접근성 최적화

export const FontSizes = {
  small: 16,
  normal: 18,      // 기본값
  large: 22,
  extraLarge: 26
};

export const ColorThemes = {
  // 한지 테마 (기본) - 크림색/베이지색 배경
  hanjiTheme: {
    background: '#FFF8DC',        // 크림색 배경
    surface: '#F5F5DC',           // 베이지색 표면
    primary: '#8B4513',           // 진한 갈색 (주요 텍스트)
    secondary: '#A0522D',         // 중간 갈색
    accent: '#228B22',            // 차분한 녹색 (강조)
    accentLight: '#32CD32',       // 밝은 녹색
    text: '#654321',              // 갈색 텍스트
    textSecondary: '#8B7355',     // 보조 텍스트
    border: '#D2B48C',            // 테두리색
    card: '#FFFAF0',              // 카드 배경
    button: '#DEB887',            // 버튼 배경
    buttonText: '#8B4513',        // 버튼 텍스트
    success: '#228B22',           // 성공
    warning: '#DAA520',           // 경고
    error: '#B22222',             // 오류
    info: '#4682B4'               // 정보
  },
  
  // 밝은 테마
  lightTheme: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#333333',
    secondary: '#666666',
    accent: '#007AFF',
    accentLight: '#4DA6FF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    card: '#FFFFFF',
    button: '#F0F0F0',
    buttonText: '#333333',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8'
  },
  
  // 어두운 테마
  darkTheme: {
    background: '#1A1A1A',
    surface: '#2D2D2D',
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    accent: '#FF6B35',
    accentLight: '#FF8A5B',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#404040',
    card: '#2D2D2D',
    button: '#404040',
    buttonText: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  
  // 고대비 테마 (시각장애인용)
  highContrastTheme: {
    background: '#000000',
    surface: '#000000',
    primary: '#FFFFFF',
    secondary: '#FFFF00',        // 노란색 보조
    accent: '#00FF00',           // 초록색 강조
    accentLight: '#80FF80',
    text: '#FFFFFF',
    textSecondary: '#FFFF00',
    border: '#FFFFFF',
    card: '#000000',
    button: '#FFFFFF',
    buttonText: '#000000',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    info: '#00FFFF'
  }
};

// 공통 스타일
export const CommonStyles = {
  // 컨테이너
  container: {
    flex: 1,
    padding: 20
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  
  // 카드 스타일
  card: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  
  // 버튼 스타일
  button: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,  // 터치 영역 최소 크기
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  
  smallButton: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 80
  },
  
  // 입력 필드
  input: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    fontSize: 18,
    minHeight: 56
  },
  
  // 텍스트 스타일
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28
  },
  
  subtitle: {
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24
  },
  
  body: {
    lineHeight: 24,
    marginBottom: 8
  },
  
  caption: {
    fontSize: 14,
    lineHeight: 20
  },
  
  // 레이아웃
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  // 간격
  marginBottom: {
    marginBottom: 16
  },
  
  marginTop: {
    marginTop: 16
  },
  
  // 접근성
  accessible: {
    accessibilityRole: 'button',
    accessible: true
  }
};

// 화면별 스타일 생성 함수
export const createStyles = (theme, fontSize = 'normal') => {
  const currentFontSize = FontSizes[fontSize];
  
  return {
    // 배경
    background: {
      backgroundColor: theme.background
    },
    
    surface: {
      backgroundColor: theme.surface
    },
    
    // 카드
    card: {
      ...CommonStyles.card,
      backgroundColor: theme.card,
      borderColor: theme.border
    },
    
    // 버튼
    primaryButton: {
      ...CommonStyles.button,
      backgroundColor: theme.accent
    },
    
    secondaryButton: {
      ...CommonStyles.button,
      backgroundColor: theme.button,
      borderWidth: 1,
      borderColor: theme.border
    },
    
    smallButton: {
      ...CommonStyles.smallButton,
      backgroundColor: theme.button,
      borderWidth: 1,
      borderColor: theme.border
    },
    
    // 텍스트
    titleText: {
      ...CommonStyles.title,
      fontSize: currentFontSize + 8,
      color: theme.primary
    },
    
    subtitleText: {
      ...CommonStyles.subtitle,
      fontSize: currentFontSize + 2,
      color: theme.primary
    },
    
    bodyText: {
      ...CommonStyles.body,
      fontSize: currentFontSize,
      color: theme.text
    },
    
    secondaryText: {
      ...CommonStyles.body,
      fontSize: currentFontSize - 2,
      color: theme.textSecondary
    },
    
    buttonText: {
      fontSize: currentFontSize,
      fontWeight: '600',
      color: theme.buttonText
    },
    
    primaryButtonText: {
      fontSize: currentFontSize,
      fontWeight: 'bold',
      color: '#FFFFFF'
    },
    
    // 입력 필드
    input: {
      ...CommonStyles.input,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      color: theme.text,
      fontSize: currentFontSize
    },
    
    // 상태별 색상
    successText: {
      color: theme.success,
      fontSize: currentFontSize
    },
    
    warningText: {
      color: theme.warning,
      fontSize: currentFontSize
    },
    
    errorText: {
      color: theme.error,
      fontSize: currentFontSize
    },
    
    infoText: {
      color: theme.info,
      fontSize: currentFontSize
    }
  };
};

// 애니메이션 설정 (최소화 - 접근성 고려)
export const Animations = {
  // 부드러운 페이드 효과만 사용
  fadeIn: {
    opacity: 1,
    duration: 300
  },
  
  fadeOut: {
    opacity: 0,
    duration: 200
  }
};

export default {
  FontSizes,
  ColorThemes,
  CommonStyles,
  createStyles,
  Animations
};
