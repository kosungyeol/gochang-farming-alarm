import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

// 화면 컴포넌트들
import LoadingScreen from '../components/common/LoadingScreen';
import UserRegistrationScreen from '../screens/auth/UserRegistrationScreen';
import MainScreen from '../screens/main/MainScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import DisplaySettingsScreen from '../screens/settings/DisplaySettingsScreen';
import ProfileEditScreen from '../screens/settings/ProfileEditScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 메인 탭 네비게이터
const MainTabNavigator = () => {
  const { theme, fontSize } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarLabelStyle: {
          fontSize: fontSize === 'large' ? 14 : fontSize === 'extraLarge' ? 16 : 12,
          fontWeight: '600'
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{
          tabBarLabel: '사업',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📋</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
};

// 메인 스택 네비게이터
const AppNavigator = () => {
  const { user, isLoading } = useUser();
  const { theme } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.background }
        }}
      >
        {!user ? (
          // 사용자가 등록되지 않은 경우
          <Stack.Screen 
            name="UserRegistration" 
            component={UserRegistrationScreen}
            options={{ animationEnabled: false }}
          />
        ) : (
          // 사용자가 등록된 경우
          <>
            <Stack.Screen 
              name="MainTab" 
              component={MainTabNavigator}
              options={{ animationEnabled: false }}
            />
            <Stack.Screen 
              name="Notification" 
              component={NotificationScreen}
              options={{
                animationEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress
                  }
                })
              }}
            />
            <Stack.Screen 
              name="NotificationSettings" 
              component={NotificationSettingsScreen}
              options={{
                animationEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress
                  }
                })
              }}
            />
            <Stack.Screen 
              name="DisplaySettings" 
              component={DisplaySettingsScreen}
              options={{
                animationEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress
                  }
                })
              }}
            />
            <Stack.Screen 
              name="ProfileEdit" 
              component={ProfileEditScreen}
              options={{
                animationEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress
                  }
                })
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;