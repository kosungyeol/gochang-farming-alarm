import Tts from 'react-native-tts';
import { StorageService } from '../storage/StorageService';

class TTSService {
  constructor() {
    this.isInitialized = false;
    this.currentSettings = {
      voiceGender: 'female',    // 여성 목소리 기본값
      speed: 'normal',          // 보통 속도 기본값
      enabled: true
    };
  }

  async initialize() {
    try {
      if (this.isInitialized) return;

      // TTS 기본 설정
      await Tts.setDefaultLanguage('ko-KR');
      
      // 저장된 설정 로드
      await this.loadSettings();
      
      // 설정 적용
      await this.applySettings();
      
      this.isInitialized = true;
      console.log('TTS 서비스 초기화 완료');
      
    } catch (error) {
      console.error('TTS 초기화 오류:', error);
    }
  }

  async loadSettings() {
    try {
      const savedSettings = await StorageService.getItem('ttsSettings');
      if (savedSettings) {
        this.currentSettings = { ...this.currentSettings, ...savedSettings };
      }
    } catch (error) {
      console.error('TTS 설정 로드 오류:', error);
    }
  }

  async saveSettings() {
    try {
      await StorageService.setItem('ttsSettings', this.currentSettings);
    } catch (error) {
      console.error('TTS 설정 저장 오류:', error);
    }
  }

  async applySettings() {
    try {
      // 목소리 성별 설정
      await this.setVoiceGender(this.currentSettings.voiceGender);
      
      // 속도 설정
      await this.setSpeed(this.currentSettings.speed);
      
    } catch (error) {
      console.error('TTS 설정 적용 오류:', error);
    }
  }

  async setVoiceGender(gender) {
    try {
      this.currentSettings.voiceGender = gender;
      
      // Android/iOS에 따른 음성 설정
      if (gender === 'male') {
        await Tts.setDefaultVoice('ko-kr-x-koc-network'); // 남성 목소리
      } else {
        await Tts.setDefaultVoice('ko-kr-x-kof-network'); // 여성 목소리
      }
      
      await this.saveSettings();
    } catch (error) {
      console.error('음성 성별 설정 오류:', error);
    }
  }

  async setSpeed(speed) {
    try {
      this.currentSettings.speed = speed;
      
      const speedMap = {
        'very_slow': 0.3,   // 매우 느림 (시각장애인용)
        'slow': 0.5,        // 느림 (고령자 친화)
        'normal': 0.7,      // 보통 (기본값)
        'fast': 1.0         // 빠름 (익숙한 사용자용)
      };
      
      const rate = speedMap[speed] || 0.7;
      await Tts.setDefaultRate(rate);
      
      await this.saveSettings();
    } catch (error) {
      console.error('음성 속도 설정 오류:', error);
    }
  }

  async setEnabled(enabled) {
    this.currentSettings.enabled = enabled;
    await this.saveSettings();
  }

  async speak(text, options = {}) {
    try {
      if (!this.currentSettings.enabled) return;
      
      // TTS가 이미 실행 중이면 중지
      await this.stop();
      
      const ttsOptions = {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 1.0,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
        iosVoiceId: 'com.apple.ttsbundle.Yuna-compact',
        ...options
      };
      
      await Tts.speak(text, ttsOptions);
      
    } catch (error) {
      console.error('TTS 재생 오류:', error);
    }
  }

  async stop() {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('TTS 중지 오류:', error);
    }
  }

  async pause() {
    try {
      await Tts.pause();
    } catch (error) {
      console.error('TTS 일시정지 오류:', error);
    }
  }

  async resume() {
    try {
      await Tts.resume();
    } catch (error) {
      console.error('TTS 재개 오류:', error);
    }
  }

  // 화면 진입시 안내 메시지들
  getScreenWelcomeMessage(screenName, userName = '농업인') {
    const messages = {
      userRegistration: '농업 알리미 가입화면입니다. 이름, 생년월일, 성별, 업종을 입력해주세요.',
      main: `농업 알리미 메인화면입니다. ${userName}님! 새 알림, 이달의 사업, 내 관심사업, 설정 버튼이 있어요.`,
      projects: '이달의 사업 화면입니다. 이번 달에 신청할 수 있는 농업 사업들을 보여드려요.',
      notification: '사업 안내 화면입니다. 선택하신 사업의 자세한 내용을 안내해드려요.',
      settings: '설정화면입니다. 개인정보, 관심사업, 알림설정, 화면설정, 앱정보를 관리할 수 있어요.',
      notificationSettings: '알림 설정 화면입니다. 푸시알림, 알림 시간, 음성 목소리, 음성 속도를 설정할 수 있어요.',
      displaySettings: '화면 설정 화면입니다. 폰트 크기와 색상 테마를 변경할 수 있어요.'
    };
    
    return messages[screenName] || '화면이 준비되었습니다.';
  }

  // 버튼 클릭시 안내 메시지들
  getActionMessage(action, projectName = '') {
    const messages = {
      listenDetail: `${projectName} 사업 내용을 자세히 안내해드릴게요.`,
      registerInterest: `${projectName} 사업을 관심사업으로 등록했어요. 알림을 받으실 수 있어요.`,
      removeInterest: `${projectName} 사업 알림을 해제했어요. 다시 등록하려면 관심등록을 눌러주세요.`,
      remindTomorrow: '내일 같은 시간에 알림을 다시 보내드릴게요.',
      alreadyKnow: '이미 알고 계시는군요! 필요할 때 다시 안내해드릴게요.',
      remindNextYear: '내년에 같은 사업이 있을 때 다시 안내해드릴게요.',
      speedChanged: `음성 속도를 ${this.getSpeedName(this.currentSettings.speed)}로 변경했습니다. 지금부터 이 속도로 안내해드릴게요.`,
      fontSizeChanged: '폰트 크기를 변경했습니다. 더 잘 보이시나요?',
      themeChanged: '테마를 변경했습니다. 눈이 편하시길 바라요.',
      settingsSaved: '설정이 저장되었습니다.'
    };
    
    return messages[action] || '완료되었습니다.';
  }

  getSpeedName(speed) {
    const names = {
      'very_slow': '매우 느림',
      'slow': '느림',
      'normal': '보통',
      'fast': '빠름'
    };
    return names[speed] || '보통';
  }

  getVoiceGenderName(gender) {
    return gender === 'male' ? '남성 목소리' : '여성 목소리';
  }

  // 현재 설정 반환
  getSettings() {
    return { ...this.currentSettings };
  }

  // 설정 업데이트
  async updateSettings(newSettings) {
    const oldSettings = { ...this.currentSettings };
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    
    try {
      await this.applySettings();
      
      // 변경사항 안내
      if (oldSettings.speed !== this.currentSettings.speed) {
        await this.speak(this.getActionMessage('speedChanged'));
      }
      
      if (oldSettings.voiceGender !== this.currentSettings.voiceGender) {
        await this.speak(`${this.getVoiceGenderName(this.currentSettings.voiceGender)}로 변경되었습니다.`);
      }
      
    } catch (error) {
      console.error('TTS 설정 업데이트 오류:', error);
      // 오류 발생시 이전 설정으로 복구
      this.currentSettings = oldSettings;
    }
  }
}

// 싱글톤 인스턴스 생성
const ttsService = new TTSService();

export default ttsService;
