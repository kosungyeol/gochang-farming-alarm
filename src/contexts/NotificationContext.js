import React, { createContext, useContext, useState, useEffect } from 'react';
import NotificationService from '../services/notification/NotificationService';
import { StorageService } from '../services/storage/StorageService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    enabled: true,
    preferredTime: '08:00',
    soundEnabled: true,
    vibrationEnabled: true
  });

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // 알림 설정 로드
      const savedSettings = await StorageService.getNotificationSettings();
      setSettings(savedSettings);
      
      // 알림 이력 로드
      await loadNotifications();
      
    } catch (error) {
      console.error('알림 초기화 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationHistory = await StorageService.getNotificationHistory(50);
      setNotifications(notificationHistory);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      await NotificationService.updateNotificationSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // 읽음 상태를 저장소에도 반영
      await StorageService.recordAppUsage('notification_read', {
        notificationId,
        readAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  const addNotification = async (notification) => {
    try {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // 저장소에 저장
      await StorageService.saveNotificationHistory(newNotification);
      
      return newNotification;
    } catch (error) {
      console.error('알림 추가 오류:', error);
      return null;
    }
  };

  const clearNotifications = async () => {
    try {
      setNotifications([]);
      
      // 저장소에서도 삭제
      await StorageService.setItem('notification_history', []);
      
    } catch (error) {
      console.error('알림 삭제 오류:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  const getNotificationStats = async (days = 7) => {
    try {
      return await NotificationService.getNotificationStats(days);
    } catch (error) {
      console.error('알림 통계 조회 오류:', error);
      return null;
    }
  };

  const scheduleProjectNotification = async (project, userInterests) => {
    try {
      return await NotificationService.scheduleProjectNotifications(project, userInterests);
    } catch (error) {
      console.error('프로젝트 알림 예약 오류:', error);
      return [];
    }
  };

  const updateProjectNotifications = async (projectId, isInterested) => {
    try {
      await NotificationService.updateProjectNotifications(projectId, isInterested);
    } catch (error) {
      console.error('프로젝트 알림 업데이트 오류:', error);
    }
  };

  const value = {
    // 상태
    notifications,
    settings,
    isLoading,
    
    // 액션
    loadNotifications,
    updateNotificationSettings,
    markNotificationAsRead,
    addNotification,
    clearNotifications,
    scheduleProjectNotification,
    updateProjectNotifications,
    
    // 유틸리티
    getUnreadCount,
    getNotificationStats,
    
    // 알림 서비스 상태
    isNotificationServiceReady: NotificationService.isReady(),
    fcmToken: NotificationService.getFCMToken()
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
