import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  USER_INTERESTS: 'user_interests',
  NOTIFICATION_SETTINGS: 'notification_settings',
  TTS_SETTINGS: 'tts_settings',
  THEME_SETTINGS: 'theme_settings',
  PROJECTS_DATA: 'projects_data',
  ADMIN_DATA: 'admin_data'
};

class StorageServiceClass {
  
  // 기본 저장/불러오기
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Storage setItem 오류 (${key}):`, error);
      return false;
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Storage getItem 오류 (${key}):`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage removeItem 오류 (${key}):`, error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear 오류:', error);
      return false;
    }
  }

  // 사용자 데이터 관리
  async saveUserData(userData) {
    const userWithTimestamp = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    return await this.setItem(STORAGE_KEYS.USER_DATA, userWithTimestamp);
  }

  async getUserData() {
    return await this.getItem(STORAGE_KEYS.USER_DATA);
  }

  async clearUserData() {
    return await this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // 관심사업 관리
  async saveUserInterests(interests) {
    const interestsWithTimestamp = {
      interests,
      updatedAt: new Date().toISOString()
    };
    return await this.setItem(STORAGE_KEYS.USER_INTERESTS, interestsWithTimestamp);
  }

  async getUserInterests() {
    const data = await this.getItem(STORAGE_KEYS.USER_INTERESTS);
    return data ? data.interests : [];
  }

  async addUserInterest(projectId) {
    try {
      const currentInterests = await this.getUserInterests();
      const newInterests = [...currentInterests];
      
      if (!newInterests.includes(projectId)) {
        newInterests.push(projectId);
        await this.saveUserInterests(newInterests);
      }
      
      return true;
    } catch (error) {
      console.error('관심사업 추가 오류:', error);
      return false;
    }
  }

  async removeUserInterest(projectId) {
    try {
      const currentInterests = await this.getUserInterests();
      const newInterests = currentInterests.filter(id => id !== projectId);
      await this.saveUserInterests(newInterests);
      return true;
    } catch (error) {
      console.error('관심사업 제거 오류:', error);
      return false;
    }
  }

  // 알림 설정 관리
  async saveNotificationSettings(settings) {
    const settingsWithTimestamp = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    return await this.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settingsWithTimestamp);
  }

  async getNotificationSettings() {
    const data = await this.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return data || {
      enabled: true,
      preferredTime: '08:00',
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  // 사업 데이터 관리 (로컬 캐시)
  async saveProjectsData(projects) {
    const projectsWithTimestamp = {
      projects,
      updatedAt: new Date().toISOString(),
      cachedAt: new Date().toISOString()
    };
    return await this.setItem(STORAGE_KEYS.PROJECTS_DATA, projectsWithTimestamp);
  }

  async getProjectsData() {
    const data = await this.getItem(STORAGE_KEYS.PROJECTS_DATA);
    return data ? data.projects : [];
  }

  async getProjectById(projectId) {
    const projects = await this.getProjectsData();
    return projects.find(project => project.id === projectId);
  }

  // 관리자 데이터 관리
  async saveAdminData(adminData) {
    const dataWithTimestamp = {
      ...adminData,
      updatedAt: new Date().toISOString()
    };
    return await this.setItem(STORAGE_KEYS.ADMIN_DATA, dataWithTimestamp);
  }

  async getAdminData() {
    return await this.getItem(STORAGE_KEYS.ADMIN_DATA);
  }

  // 통계 데이터 관리
  async saveUserStats(stats) {
    const statsKey = `user_stats_${new Date().toISOString().split('T')[0]}`;
    return await this.setItem(statsKey, {
      ...stats,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
  }

  async getUserStats(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const statsKey = `user_stats_${targetDate}`;
    return await this.getItem(statsKey);
  }

  // 알림 이력 관리
  async saveNotificationHistory(notification) {
    try {
      const historyKey = 'notification_history';
      const currentHistory = await this.getItem(historyKey) || [];
      
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      // 최근 100개만 유지
      const updatedHistory = [newNotification, ...currentHistory].slice(0, 100);
      
      return await this.setItem(historyKey, updatedHistory);
    } catch (error) {
      console.error('알림 이력 저장 오류:', error);
      return false;
    }
  }

  async getNotificationHistory(limit = 50) {
    try {
      const history = await this.getItem('notification_history') || [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('알림 이력 조회 오류:', error);
      return [];
    }
  }

  // 앱 사용 통계
  async recordAppUsage(action, metadata = {}) {
    try {
      const usageKey = 'app_usage';
      const currentUsage = await this.getItem(usageKey) || [];
      
      const usageRecord = {
        action,
        metadata,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      
      // 최근 1000개 기록만 유지
      const updatedUsage = [usageRecord, ...currentUsage].slice(0, 1000);
      
      return await this.setItem(usageKey, updatedUsage);
    } catch (error) {
      console.error('앱 사용 기록 오류:', error);
      return false;
    }
  }

  async getAppUsage(days = 7) {
    try {
      const usage = await this.getItem('app_usage') || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return usage.filter(record => 
        new Date(record.timestamp) >= cutoffDate
      );
    } catch (error) {
      console.error('앱 사용 통계 조회 오류:', error);
      return [];
    }
  }

  // 데이터 백업/복원
  async exportData() {
    try {
      const allData = {};
      
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        allData[name] = await this.getItem(key);
      }
      
      // 추가 데이터들
      allData.NOTIFICATION_HISTORY = await this.getItem('notification_history');
      allData.APP_USAGE = await this.getItem('app_usage');
      
      return {
        ...allData,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      return null;
    }
  }

  async importData(data) {
    try {
      if (!data || !data.version) {
        throw new Error('유효하지 않은 백업 데이터');
      }
      
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        if (data[name]) {
          await this.setItem(key, data[name]);
        }
      }
      
      // 추가 데이터들
      if (data.NOTIFICATION_HISTORY) {
        await this.setItem('notification_history', data.NOTIFICATION_HISTORY);
      }
      
      if (data.APP_USAGE) {
        await this.setItem('app_usage', data.APP_USAGE);
      }
      
      return true;
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      return false;
    }
  }

  // 캐시 관리
  async clearCache() {
    try {
      await this.removeItem(STORAGE_KEYS.PROJECTS_DATA);
      return true;
    } catch (error) {
      console.error('캐시 삭제 오류:', error);
      return false;
    }
  }

  // 저장공간 사용량 확인
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      const itemSizes = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        itemSizes[key] = size;
        totalSize += size;
      }
      
      return {
        totalSize,
        itemCount: keys.length,
        itemSizes,
        keys
      };
    } catch (error) {
      console.error('저장공간 정보 조회 오류:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const StorageService = new StorageServiceClass();
