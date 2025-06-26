import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage/StorageService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      setUser(userData);
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      await StorageService.saveUserData(updatedUser);
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('사용자 데이터 업데이트 오류:', error);
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: Date.now().toString(), // 간단한 ID 생성
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await StorageService.saveUserData(newUser);
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('사용자 등록 오류:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await StorageService.clearUserData();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 사용자 나이 계산
  const getUserAge = () => {
    if (!user?.birthDate) return null;
    
    const birth = new Date(user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 업종 한글 이름 변환
  const getIndustryNames = () => {
    if (!user?.industries) return [];
    
    const industryMap = {
      agriculture: '농업',
      forestry: '임업',
      livestock: '축산',
      fishery: '수산'
    };
    
    return user.industries.map(industry => industryMap[industry] || industry);
  };

  const value = {
    user,
    isLoading,
    updateUser,
    registerUser,
    logout,
    getUserAge,
    getIndustryNames,
    // 편의 함수들
    isRegistered: !!user,
    userName: user?.name || '농업인',
    userIndustries: user?.industries || []
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
