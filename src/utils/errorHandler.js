// 글로벌 오류 핸들러
// React Native 앱의 전역 오류를 처리합니다.

import { Alert } from 'react-native';

// JavaScript 오류 핸들러
const defaultErrorHandler = ErrorUtils.getGlobalHandler();

const globalErrorHandler = (error, isFatal) => {
  console.error('글로벌 오류 발생:', error);
  
  if (isFatal) {
    Alert.alert(
      '앱 오류',
      '앱에서 심각한 오류가 발생했습니다. 앱을 다시 시작해주세요.',
      [
        {
          text: '확인',
          onPress: () => {
            // 기본 오류 핸들러 호출
            defaultErrorHandler(error, isFatal);
          }
        }
      ]
    );
  } else {
    // 치명적이지 않은 오류는 기본 핸들러에게 위임
    defaultErrorHandler(error, isFatal);
  }
};

// 전역 오류 핸들러 설정
ErrorUtils.setGlobalHandler(globalErrorHandler);

// Promise rejection 핸들러
const handleUnhandledRejection = (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  
  // 개발 모드에서는 상세 정보 표시
  if (__DEV__) {
    console.error('Promise:', promise);
  }
};

// 처리되지 않은 Promise rejection 이벤트 리스너
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    handleUnhandledRejection(event.reason, event.promise);
    event.preventDefault(); // 기본 동작 방지
  });
}

// 개발 도구용 로깅 함수
export const logError = (context, error, additionalInfo = {}) => {
  const errorInfo = {
    context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  console.error('앱 오류 로그:', errorInfo);
  
  // 실제 서비스에서는 오류 추적 서비스(Crashlytics 등)로 전송
  // Example: crashlytics().recordError(error);
};

// 사용자 친화적 오류 메시지 표시
export const showUserFriendlyError = (title = '오류', message = '예상치 못한 오류가 발생했습니다.') => {
  Alert.alert(
    title,
    message,
    [{ text: '확인' }]
  );
};

// 네트워크 오류 처리
export const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    showUserFriendlyError(
      '연결 오류',
      '인터넷 연결을 확인하고 다시 시도해주세요.'
    );
  } else {
    showUserFriendlyError();
  }
};

export default {
  globalErrorHandler,
  logError,
  showUserFriendlyError,
  handleNetworkError
};
