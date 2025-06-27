# 🌾 고창 농업 알리미

고창군 농업인을 위한 보조사업 안내 및 알림 모바일 앱입니다.

## 📱 주요 기능

- **🔔 맞춤형 알림**: 개인 관심사업 기반 스마트 알림
- **🗣️ 음성 안내**: 60세 이상 농업인을 위한 TTS 음성 지원
- **📅 월별 사업 관리**: 신청 가능한 사업들의 체계적 관리
- **⚙️ 접근성 최적화**: 큰 글자, 고대비 모드, 간편한 UI
- **📊 개인화 서비스**: 나이, 관심분야 기반 맞춤 정보 제공

## 🎯 대상 사용자

- 고창군 거주 농업인 (특히 60세 이상)
- 농업 보조사업에 관심 있는 모든 분들
- 시력이 불편하거나 스마트폰 사용이 어려운 분들

## 🚀 설치 및 실행

### 1️⃣ 프로젝트 클론
```bash
git clone https://github.com/kosungyeol/gochang-farming-alarm.git
cd gochang-farming-alarm
```

### 2️⃣ 의존성 설치
```bash
# npm 사용시
npm install

# yarn 사용시
yarn install
```

### 3️⃣ Android 실행
```bash
# Android 에뮬레이터 또는 실제 기기에서 실행
npm run android

# 또는
yarn android
```

### 4️⃣ iOS 실행 (Mac에서만)
```bash
# iOS 설정
cd ios && pod install && cd ..

# iOS 시뮬레이터에서 실행
npm run ios

# 또는
yarn ios
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   └── common/
├── contexts/           # React Context (상태 관리)
│   ├── ThemeContext.js    # 테마 및 접근성 설정
│   ├── UserContext.js     # 사용자 정보 관리
│   └── NotificationContext.js # 알림 관리
├── navigation/         # 네비게이션 설정
├── screens/           # 화면 컴포넌트
│   ├── auth/             # 인증 관련 화면
│   ├── main/             # 메인 화면들
│   └── settings/         # 설정 화면들
├── services/          # 비즈니스 로직
│   ├── notification/     # 알림 서비스
│   ├── storage/          # 로컬 저장소
│   └── tts/             # 음성 안내 서비스
├── styles/            # 스타일 및 테마
└── utils/             # 유틸리티 함수
```

## 🎨 주요 화면

### 📱 메인 화면
- **홈**: 오늘의 알림, 빠른 액션, 음성 안내
- **사업 목록**: 월별 보조사업 검색 및 관심등록
- **설정**: 개인정보, 알림설정, 화면설정

### ⚙️ 설정 화면
- **개인정보 수정**: 이름, 나이, 관심분야 관리
- **알림 설정**: 알림 시간, 방식, 특별 알림 설정
- **화면 설정**: 글자크기, 테마 변경 (접근성 최적화)

## 🔧 기술 스택

- **Framework**: React Native 0.72
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **Voice**: React Native TTS
- **Icons**: React Native Vector Icons
- **Charts**: React Native Chart Kit
- **HTTP Client**: Axios

## 🎯 접근성 특화 기능

### 👁️ 시각 접근성
- **3단계 글자 크기**: 보통 → 큰 글자 → 매우 큰 글자
- **고대비 모드**: 저시력 사용자를 위한 선명한 색상 대비
- **다크 모드**: 야간 사용시 눈의 피로 감소

### 🗣️ 청각 접근성
- **TTS 음성 안내**: 모든 버튼과 내용 음성 지원
- **화면별 환영 메시지**: 각 화면 진입시 음성 설명
- **상세 내용 음성**: 사업 내용을 자세히 들려주는 기능

### 🤏 조작 접근성
- **큰 터치 영역**: 60세 이상 사용자를 위한 큰 버튼
- **간편한 네비게이션**: 직관적이고 단순한 화면 구성
- **빠른 응답 버튼**: "내일다시", "알고있음" 등 원터치 응답

## 📊 데이터 관리

### 로컬 저장소
- 사용자 개인정보 (이름, 나이, 관심분야)
- 알림 설정 (시간, 방식, 특별 알림)
- 화면 설정 (테마, 글자크기)
- 관심사업 목록
- 앱 사용 통계

### 보안 및 프라이버시
- 모든 개인정보는 기기 내에서만 저장
- 외부 서버로 개인정보 전송하지 않음
- 사용자 동의 없는 데이터 수집 금지

## 🔔 알림 시스템

### 스마트 알림
- **맞춤형 알림**: 관심분야 기반 필터링
- **마감일 알림**: 신청 마감 3일 전 자동 알림
- **주간 요약**: 매주 이번 주 중요 사업 요약

### 알림 방식
- **푸시 알림**: 시각적 알림
- **음성 안내**: TTS 음성 알림
- **진동**: 청각 장애인을 위한 진동 알림

## 🎮 사용법

### 1️⃣ 첫 실행시
1. 이름, 나이, 관심분야 입력
2. 알림 권한 허용
3. 음성 안내 테스트

### 2️⃣ 일상 사용
1. 홈 화면에서 오늘의 알림 확인
2. "🔊 들어보기" 버튼으로 음성 안내 청취
3. 관심있는 사업은 "⭐ 관심등록"

### 3️⃣ 설정 최적화
1. 설정 → 화면 설정에서 글자크기 조정
2. 알림 설정에서 원하는 시간대 설정
3. 개인정보 수정으로 관심분야 업데이트

## 🐛 문제 해결

### 일반적인 문제
```bash
# Android 빌드 오류시
cd android && ./gradlew clean && cd ..
npm run android

# Metro 캐시 클리어
npx react-native start --reset-cache

# node_modules 재설치
rm -rf node_modules && npm install
```

### TTS 음성이 안 들릴 때
- 기기 볼륨 확인
- TTS 엔진 설정 확인 (Android 설정 → 접근성 → 텍스트 음성 변환)
- 앱 권한에서 마이크 권한 확인

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

**고창군청 농업과**
- 📧 Email: agriculture@gochang.go.kr
- 📞 Phone: 063-560-2000
- 🏢 Address: 전라북도 고창군 고창읍 중앙로 200

## 🎯 향후 계획

### v1.1 (2025년 하반기)
- [ ] 웹 관리자 페이지 (엑셀 업로드)
- [ ] 실시간 사업 정보 연동
- [ ] 위치 기반 읍면사무소 정보

### v1.2 (2026년 상반기)
- [ ] 사업 신청 진행상황 추적
- [ ] 농업인 커뮤니티 기능
- [ ] 다국어 지원 (베트남어, 중국어)

### v2.0 (2026년 하반기)
- [ ] AI 기반 맞춤 추천
- [ ] 음성 인식 입력
- [ ] AR 기반 농작물 진단

## 📋 완성된 기능들

### ✅ 구현 완료된 화면들
- [x] **UserRegistrationScreen** - 개인정보 입력 및 회원가입
- [x] **MainScreen** - 홈 화면 (알림, 빠른 액션)
- [x] **ProjectsScreen** - 월별 사업 목록 및 관심등록
- [x] **NotificationScreen** - 알림 상세 및 음성 안내
- [x] **SettingsScreen** - 설정 메인 화면
- [x] **NotificationSettingsScreen** - 알림 설정
- [x] **DisplaySettingsScreen** - 화면 설정
- [x] **ProfileEditScreen** - 개인정보 수정

### ✅ 구현 완료된 서비스들
- [x] **TTSService** - 음성 안내 시스템
- [x] **NotificationService** - 푸시 알림 관리
- [x] **StorageService** - 로컬 데이터 저장
- [x] **ThemeContext** - 테마 및 접근성 관리
- [x] **UserContext** - 사용자 정보 관리
- [x] **NotificationContext** - 알림 상태 관리

### ✅ 네비게이션 시스템
- [x] **AppNavigator** - 전체 앱 네비게이션
- [x] **탭 네비게이션** - 홈, 사업, 설정
- [x] **스택 네비게이션** - 화면 전환 및 뒤로가기

## 🚀 **이제 바로 실행 가능한 완전한 앱입니다!**

**모든 화면과 기능이 구현되었습니다. 클론하셔서 바로 실행해보세요!**

```bash
git clone https://github.com/kosungyeol/gochang-farming-alarm.git
cd gochang-farming-alarm
npm install
npm run android
```

---

**💚 고창군 농업인을 위한 스마트 농업 생활을 응원합니다! 🌾**
