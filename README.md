# EDUVER (에듀버) 🎓✉️

깔끔하고 직관적인 UI/UX를 모티브로 제작된 초등/학생 맞춤형 웹 포털, 인터랙티브 웹메일, 카페, 블로그 및 계정 관리 통합 교육 플랫폼입니다.

---

## 🌟 주요 기능

### 1. 포털 메인 (`index.html`)
- **에듀버 메인 포털**: 실시간 검색어, 맞춤형 교육 뉴스스탠드(EBS, NASA, 내셔널지오그래픽 등), 바로가기 서비스 링크
- **통합 로그인/로그아웃 시스템**: LocalStorage 및 PocketBase 기반 계정 인증
- **미니 프로필 카드**: 로그인 사용자 정보, 안 읽은 메일 알림 배지 및 내 블로그 바로가기 실시간 표시

### 2. 인터랙티브 웹메일 (`mail.html`)
- **실시간 받은 메일함 / 보낸 메일함**: PocketBase BaaS 연동을 통한 실시간 메일 송수신
- **실시간 수신확인 기능**: 
  - 상대방이 메일을 읽었는지 여부 확인 (`읽지않음` / `수신 일시` 표시)
  - 좌측 사이드바 `수신확인` 전용 탭 제공
- **리치 텍스트 웹 에디터**: 폰트 종류/크기, 굵게, 기울임, 밑줄, 취소선, 글자색/배경색, 정렬 및 파일 첨부 지원
- **메일 상세 조회 및 삭제**: 메일 상세 뷰 확인 및 메일 삭제(DELETE) 처리

### 3. 블로그 서비스 (`blog.html`, `blog-write.html`, `my-blog.html`)
- **블로그 메인 (`blog.html`)**: 주제별 최신 포스트 둘러보기 및 추천 블로그 피드
- **스마트 글쓰기 에디터 (`blog-write.html`)**: 카테고리 설정, 태그 입력, 텍스트 서식 지정 및 썸네일 이미지 첨부
- **내 블로그 (`my-blog.html`)**: 개인별 블로그 프로필, 작성한 포스트 목록 관리, 상세 읽기 모달 및 삭제 기능

### 4. 계정 관리 및 복구 (`find-id.html`, `find-password.html`, `signup.html`)
- **회원가입 (`signup.html`)**: 실시간 폼 유효성 검사 (아이디 중복 확인, 비밀번호 안전도 체크, 통신사 인증 UI 등)
- **아이디 찾기 (`find-id.html`)**: 이름과 등록된 이메일 또는 휴대폰 번호를 통한 계정 아이디 조회
- **비밀번호 재설정 (`find-password.html`)**: 본인 인증을 통한 안전한 비밀번호 재설정

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
├── index.html          # 에듀버 메인 포털
├── style.css           # 메인 포털 스타일시트
├── main.js             # 메인 포털 인터랙션 및 상태 관리
├── mail.html           # 웹메일 클라이언트 화면
├── mail.css            # 웹메일 전용 스타일시트
├── mail.js             # 웹메일 송수신, 수신확인 및 리치에디터 로직
├── blog.html           # 블로그 메인 화면
├── blog-write.html     # 블로그 글쓰기 에디터
├── my-blog.html        # 내 블로그 관리 및 포스트 뷰
├── blog.css            # 블로그 전용 스타일시트
├── blog.js             # 블로그 CRUD 및 인터랙션 로직
├── find-id.html        # 아이디 찾기 화면
├── find-id.js          # 아이디 찾기 로직
├── find-password.html  # 비밀번호 재설정 화면
├── find-password.js    # 비밀번호 재설정 로직
├── signup.html         # 회원가입 화면
├── signup.css          # 회원가입 스타일시트
├── signup.js           # 회원가입 유효성 검사 로직
├── default-avatar.svg  # 기본 프로필 아바타 이미지
├── docker-compose.yml  # 도커 배포 설정
└── README.md           # 프로젝트 문서
```

---

## 📄 라이선스
This project is open-source and available for educational purposes.
