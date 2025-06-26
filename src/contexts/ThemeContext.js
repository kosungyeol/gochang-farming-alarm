import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage/StorageService';
import { ColorThemes, FontSizes } from '../styles/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('hanjiTheme');
  const [fontSize, setFontSize] = useState('large'); // 고령자 친화적으로 기본 크게
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedTheme = await StorageService.getItem('theme');
      const savedFontSize = await StorageService.getItem('fontSize');
      
      if (savedTheme && ColorThemes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
      
      if (savedFontSize && FontSizes[savedFontSize]) {
        setFontSize(savedFontSize);
      }
    } catch (error) {
      console.error('테마 설정 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (newTheme) => {
    if (ColorThemes[newTheme]) {
      setCurrentTheme(newTheme);
      await StorageService.setItem('theme', newTheme);
    }
  };

  const changeFontSize = async (newFontSize) => {
    if (FontSizes[newFontSize]) {
      setFontSize(newFontSize);
      await StorageService.setItem('fontSize', newFontSize);
    }
  };

  const getTheme = () => ColorThemes[currentTheme];
  
  const getFontSize = () => FontSizes[fontSize];

  const value = {
    currentTheme,
    fontSize,
    theme: getTheme(),
    fontSizeValue: getFontSize(),
    changeTheme,
    changeFontSize,
    isLoading,
    // 테마 이름들
    availableThemes: Object.keys(ColorThemes),
    availableFontSizes: Object.keys(FontSizes),
    // 테마 한글 이름
    getThemeName: (themeKey) => {
      const names = {
        hanjiTheme: '한지 느낌',
        lightTheme: '밝은 테마',
        darkTheme: '어두운 테마',
        highContrastTheme: '고대비 테마'
      };
      return names[themeKey] || themeKey;
    },
    // 폰트 크기 한글 이름
    getFontSizeName: (fontSizeKey) => {
      const names = {
        small: '작게',
        normal: '보통',
        large: '크게',
        extraLarge: '매우 크게'
      };
      return names[fontSizeKey] || fontSizeKey;
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
