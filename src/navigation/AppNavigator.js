import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// 화면 컴포넌트 import
import UserRegistrationScreen from '../screens/auth/UserRegistrationScreen';
import MainScreen from '../screens/main/MainScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import DisplaySettingsScreen from '../screens/settings/DisplaySettingsScreen';
import ProfileEditScreen from '../screens/settings/ProfileEditScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRoute = 'UserRegistration' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false, // 헤더 숨김 (접근성을 위해 간단한 UI)
        gestureEnabled: false, // 제스처 비활성화 (실수 방지)
        animationEnabled: false, // 애니메이션 비활성화 (성능 및 접근성)
      }}
    >
      {/* 인증/등록 화면 */}
      <Stack.Screen 
        name="UserRegistration" 
        component={UserRegistrationScreen}
        options={{ title: '농업 알리미 가입' }}
      />
      
      {/* 메인 화면들 */}
      <Stack.Screen 
        name="Main" 
        component={MainScreen}
        options={{ title: '농업 알리미' }}
      />
      
      <Stack.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: '이달의 사업' }}
      />
      
      <Stack.Screen 
        name="Notification" 
        component={NotificationScreen}
        options={{ title: '사업 안내' }}
      />
      
      {/* 설정 화면들 */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '설정' }}
      />
      
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ title: '알림 설정' }}
      />
      
      <Stack.Screen 
        name="DisplaySettings" 
        component={DisplaySettingsScreen}
        options={{ title: '화면 설정' }}
      />
      
      <Stack.Screen 
        name="ProfileEdit" 
        component={ProfileEditScreen}
        options={{ title: '개인정보 수정' }}
      />
      
      {/* 관리자 화면 */}
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{ title: '관리자 대시보드' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
