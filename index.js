/**
 * 고창 농업 알리미 - 메인 엔트리 포인트
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// 글로벌 오류 처리
import './src/utils/errorHandler';

// TTS 초기화
import './src/services/tts/TTSService';

AppRegistry.registerComponent(appName, () => App);
