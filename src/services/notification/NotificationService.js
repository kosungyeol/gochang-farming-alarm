import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { StorageService } from '../storage/StorageService';

class NotificationServiceClass {
  constructor() {
    this.fcmToken = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) return;

      // FCM 토큰 요청
      await this.requestPermissionAndGetToken();
      
      // 메시지 리스너 설정
      this.setupMessageListeners();
      
      this.isInitialized = true;
      console.log('알림 서비스 초기화 완료');
      
    } catch (error) {
      console.error('알림 서비스 초기화 오류:', error);
    }
  }

  async requestPermissionAndGetToken() {
    try {
      // 알림 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('알림 권한이 거부되었습니다');
        return;
      }

      // FCM 토큰 획득
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);
      
      // 토큰을 서버에 저장 (추후 구현)
      await this.saveFCMToken(this.fcmToken);
      
    } catch (error) {
      console.error('FCM 토큰 획득 오류:', error);
    }
  }

  async saveFCMToken(token) {
    try {
      await StorageService.setItem('fcm_token', {
        token,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('FCM 토큰 저장 오류:', error);
    }
  }

  setupMessageListeners() {
    // 앱이 백그라운드에서 포그라운드로 올 때
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('백그라운드에서 알림으로 앱 열림:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // 앱이 완전히 종료된 상태에서 알림으로 실행될 때
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('종료 상태에서 알림으로 앱 실행:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // 앱이 포그라운드에 있을 때 메시지 수신
    messaging().onMessage(async remoteMessage => {
      console.log('포그라운드 메시지 수신:', remoteMessage);
      await this.handleForegroundMessage(remoteMessage);
    });

    // 토큰 갱신 리스너
    messaging().onTokenRefresh(token => {
      console.log('FCM 토큰 갱신:', token);
      this.fcmToken = token;
      this.saveFCMToken(token);
    });
  }

  async handleNotificationOpen(remoteMessage) {
    try {
      const { data } = remoteMessage;
      
      // 알림 이력 저장
      await StorageService.saveNotificationHistory({
        ...remoteMessage,
        action: 'opened',
        openedAt: new Date().toISOString()
      });

      // 데이터에 따른 화면 이동 처리
      if (data?.projectId) {
        // 특정 사업 알림인 경우
        console.log('사업 알림으로 화면 이동:', data.projectId);
        // 네비게이션 처리는 화면 컴포넌트에서 수행
      }
      
    } catch (error) {
      console.error('알림 열기 처리 오류:', error);
    }
  }

  async handleForegroundMessage(remoteMessage) {
    try {
      const { notification, data } = remoteMessage;
      
      // 알림 이력 저장
      await StorageService.saveNotificationHistory({
        ...remoteMessage,
        action: 'received_foreground',
        receivedAt: new Date().toISOString()
      });

      // 포그라운드에서 알림 표시
      Alert.alert(
        notification?.title || '고창 농업 알리미',
        notification?.body || '새로운 알림이 있습니다.',
        [
          {
            text: '나중에',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: () => this.handleNotificationOpen(remoteMessage),
          },
        ]
      );
      
    } catch (error) {
      console.error('포그라운드 메시지 처리 오류:', error);
    }
  }

  // 로컬 알림 스케줄링 (사업 신청 마감 알림 등)
  async scheduleLocalNotification(options) {
    try {
      const {
        title,
        body,
        projectId,
        scheduleDate,
        type = 'project_reminder'
      } = options;

      // 현재는 기본 구현 (실제로는 react-native-push-notification 등 사용)
      console.log('로컬 알림 예약:', {
        title,
        body,
        projectId,
        scheduleDate,
        type
      });

      // 알림 예약 이력 저장
      await StorageService.setItem(`scheduled_notification_${Date.now()}`, {
        title,
        body,
        projectId,
        scheduleDate,
        type,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      });

      return true;
    } catch (error) {
      console.error('로컬 알림 예약 오류:', error);
      return false;
    }
  }

  // 사업별 알림 예약
  async scheduleProjectNotifications(project, userInterests = []) {
    try {
      if (!userInterests.includes(project.id)) {
        return; // 관심사업이 아니면 알림 안함
      }

      const notifications = [];
      const projectStartDate = new Date(project.startDate);
      
      // 알림 주기에 따른 스케줄링 (D-7, D-3, D-1, D-0)
      const notificationDays = project.notificationDays || [7, 3, 1, 0];
      
      for (const days of notificationDays) {
        const notificationDate = new Date(projectStartDate);
        notificationDate.setDate(notificationDate.getDate() - days);
        
        if (notificationDate > new Date()) {
          const title = days === 0 
            ? `오늘 마감! ${project.name}` 
            : `${days}일 후 마감! ${project.name}`;
            
          const body = `${project.name} 사업 신청을 잊지 마세요!`;
          
          await this.scheduleLocalNotification({
            title,
            body,
            projectId: project.id,
            scheduleDate: notificationDate.toISOString(),
            type: 'project_deadline'
          });
          
          notifications.push({
            days,
            scheduledDate: notificationDate.toISOString()
          });
        }
      }
      
      console.log(`${project.name} 사업 알림 ${notifications.length}개 예약 완료`);
      return notifications;
      
    } catch (error) {
      console.error('사업 알림 예약 오류:', error);
      return [];
    }
  }

  // 관심사업 변경시 알림 재설정
  async updateProjectNotifications(projectId, isInterested) {
    try {
      if (isInterested) {
        // 관심사업으로 등록 -> 알림 활성화
        const project = await StorageService.getProjectById(projectId);
        if (project) {
          await this.scheduleProjectNotifications(project, [projectId]);
        }
      } else {
        // 관심사업에서 제거 -> 알림 비활성화
        await this.cancelProjectNotifications(projectId);
      }
    } catch (error) {
      console.error('프로젝트 알림 업데이트 오류:', error);
    }
  }

  // 특정 사업의 알림 취소
  async cancelProjectNotifications(projectId) {
    try {
      // 예약된 알림들을 찾아서 취소
      const storageInfo = await StorageService.getStorageInfo();
      if (!storageInfo) return;

      for (const key of storageInfo.keys) {
        if (key.startsWith('scheduled_notification_')) {
          const notification = await StorageService.getItem(key);
          if (notification?.projectId === projectId) {
            await StorageService.removeItem(key);
          }
        }
      }
      
      console.log(`${projectId} 사업 알림 취소 완료`);
    } catch (error) {
      console.error('사업 알림 취소 오류:', error);
    }
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(settings) {
    try {
      await StorageService.saveNotificationSettings(settings);
      
      // 설정에 따라 알림 재스케줄링
      if (!settings.enabled) {
        await this.cancelAllNotifications();
      } else {
        await this.rescheduleAllNotifications();
      }
      
      return true;
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error);
      return false;
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications() {
    try {
      const storageInfo = await StorageService.getStorageInfo();
      if (!storageInfo) return;

      for (const key of storageInfo.keys) {
        if (key.startsWith('scheduled_notification_')) {
          await StorageService.removeItem(key);
        }
      }
      
      console.log('모든 예약된 알림 취소 완료');
    } catch (error) {
      console.error('전체 알림 취소 오류:', error);
    }
  }

  // 모든 알림 재스케줄링
  async rescheduleAllNotifications() {
    try {
      const userInterests = await StorageService.getUserInterests();
      const projects = await StorageService.getProjectsData();
      
      // 기존 알림 모두 취소
      await this.cancelAllNotifications();
      
      // 관심사업들에 대한 알림 재설정
      for (const projectId of userInterests) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          await this.scheduleProjectNotifications(project, userInterests);
        }
      }
      
      console.log('모든 알림 재스케줄링 완료');
    } catch (error) {
      console.error('알림 재스케줄링 오류:', error);
    }
  }

  // 알림 통계
  async getNotificationStats(days = 30) {
    try {
      const history = await StorageService.getNotificationHistory(1000);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentHistory = history.filter(notification => 
        new Date(notification.timestamp) >= cutoffDate
      );
      
      const stats = {
        totalReceived: recentHistory.filter(n => n.action === 'received_foreground').length,
        totalOpened: recentHistory.filter(n => n.action === 'opened').length,
        openRate: 0,
        byProject: {}
      };
      
      if (stats.totalReceived > 0) {
        stats.openRate = (stats.totalOpened / stats.totalReceived) * 100;
      }
      
      // 사업별 통계
      recentHistory.forEach(notification => {
        const projectId = notification.data?.projectId;
        if (projectId) {
          if (!stats.byProject[projectId]) {
            stats.byProject[projectId] = { received: 0, opened: 0 };
          }
          
          if (notification.action === 'received_foreground') {
            stats.byProject[projectId].received++;
          } else if (notification.action === 'opened') {
            stats.byProject[projectId].opened++;
          }
        }
      });
      
      return stats;
    } catch (error) {
      console.error('알림 통계 조회 오류:', error);
      return null;
    }
  }

  // FCM 토큰 반환
  getFCMToken() {
    return this.fcmToken;
  }

  // 서비스 상태 확인
  isReady() {
    return this.isInitialized && !!this.fcmToken;
  }
}

// 싱글톤 인스턴스 생성
const NotificationService = new NotificationServiceClass();

export default NotificationService;
