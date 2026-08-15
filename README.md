# EDUNAVER (에듀네이버) 🎓✉️

네이버의 깔끔하고 직관적인 UI/UX를 모티브로 제작된 초등/학생 맞춤형 웹 포털 및 인터랙티브 웹메일 서비스 플랫폼입니다.

---

## 🌟 주요 기능

### 1. 포털 메인 (`index.html`)
- **네이버 메인 화면 모사**: 실시간 검색어, 맞춤형 교육 뉴스스탠드(EBS, NASA, 내셔널지오그래픽 등), 바로가기 서비스 링크
- **통합 로그인/로그아웃 시스템**: LocalStorage 및 PocketBase 기반 계정 인증
- **미니 프로필 카드**: 로그인 사용자 정보 및 안 읽은 메일 알림 배지 실시간 표시

### 2. 인터랙티브 웹메일 (`mail.html`)
- **실시간 받은 메일함 / 보낸 메일함**: PocketBase BaaS 연동을 통한 실시간 메일 송수신
- **실시간 수신확인 기능**: 
  - 상대방이 메일을 읽었는지 여부 확인 (`읽지않음` / `수신 일시` 표시)
  - 좌측 사이드바 `수신확인` 전용 탭 제공
- **리치 텍스트 웹 에디터**: 폰트 종류/크기, 굵게, 기울임, 밑줄, 취소선, 글자색/배경색, 정렬 및 파일 첨부 지원
- **메일 상세 조회 및 삭제**: 메일 상세 뷰 확인 및 메일 삭제(DELETE) 처리

### 3. 회원가입 (`signup.html`)
- 실시간 폼 유효성 검사 (아이디 중복 확인, 비밀번호 안전도 체크, 통신사 인증 UI 등)

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, Vanilla CSS3 (Custom Responsive System), JavaScript (ES6+)
- **Backend / Database**: [PocketBase](https://pocketbase.io/) (REST API)
- **Container**: Docker, Docker Compose

---

## 🚀 시작하기

### 로컬 실행
별도의 빌드 도구 없이 정적 웹 서버(Live Server, Nginx 등)로 바로 실행할 수 있습니다.

```bash
# 로컬 개발 서버 실행 예시 (VS Code Live Server 또는 http-server 등)
npx -y serve .
```

### Docker 실행
`docker-compose.yml`을 사용하여 손쉽게 컨테이너 환경으로 구동할 수 있습니다.

```bash
docker compose up -d
```

---

## 📁 프로젝트 구조

```text
├── index.html          # 에듀네이버 메인 포털
├── style.css           # 메인 포털 스타일시트
├── main.js             # 메인 포털 인터랙션 및 상태 관리
├── mail.html           # 웹메일 클라이언트 화면
├── mail.css            # 웹메일 전용 스타일시트
├── mail.js             # 웹메일 송수신, 수신확인 및 리치에디터 로직
├── signup.html         # 회원가입 화면
├── signup.css          # 회원가입 스타일시트
├── signup.js           # 회원가입 유효성 검사 로직
├── docker-compose.yml  # 도커 배포 설정
└── README.md           # 프로젝트 문서
```

---

## 📄 라이선스
This project is open-source and available for educational purposes.
