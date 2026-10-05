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
- **블로그 메인 (`blog.html`)**: 
  - 주제별 최신 포스트 둘러보기 및 추천 블로그 피드
  - **인페이지 포스트 뷰어**: 블로그 홈을 벗어나지 않고 포스트 본문, 공감 목록, 댓글을 즉시 열람 및 작성할 수 있는 인페이지 리더 제공
- **공감(좋아요) 및 공감한 블로거 연동**:
  - 포스트 공감 클릭 시 댓글과 동일하게 **실명 및 실제 프로필 이미지**를 일치시켜 공감 패널에 표시
  - PocketBase `users` 컬렉션 사전 캐싱 및 댓글 작성자 메타데이터 동기화를 통한 즉각적인 프로필 바인딩
  - 공감 클릭 시 로그인 사용자의 고유 프로필로 정확하게 공감자 등록
- **스마트 글쓰기 에디터 (`blog-write.html`)**: 카테고리 설정, 태그 입력, 텍스트 서식 지정 및 썸네일 이미지 첨부
- **내 블로그 (`my-blog.html`)**: 개인별 블로그 프로필 및 서재, 작성한 포스트 목록 관리, 상세 읽기, 이웃 추가 및 포스트 삭제/관리 기능

### 4. 에듀버 뉴스 서비스 및 검색 연동 (`news.html`, `news-detail.html`, `news.js`)
- **에듀버 뉴스 홈 (`news.html`)**: 특수교육, 에듀테크, 교육정책 등 주제별 최신 기사 큐레이션 및 헤드라인 뉴스 제공
- **뉴스 상세 보기 (`news-detail.html`)**: 기사 본문, 발행 언론사 및 기자 정보, 공감/댓글 참여
- **네이버 스타일 통합검색 뉴스 카드**: 
  - 통합검색 시 **뉴스 기사 제목 부분 일치 매칭** 지원
  - 언론사 로고, **PiCK 배지**, 날짜, **2줄 요약문**, **96×96 썸네일**을 포함한 네이버 뉴스 포털 스타일 카드 UI 렌더링
  - 고유 제목 기반 중복 제거(Deduplication)로 동일 기사 반복 노출 원천 차단
  - '관련뉴스 전체보기' 클릭 시 뉴스 검색 탭으로 즉시 전환

### 5. 웹마스터 도구 및 교육 사이트 등록 (`webmaster.html`)
- **웹마스터 도구 (`webmaster.html`)**: 에듀버 통합검색에 외부 교육/기관 사이트를 간편하게 등록하고 실시간 관리
- **PocketBase 전역 데이터베이스 실시간 연동**: 관리자가 등록한 웹사이트(예: 순천선혜학교 독도교육주간)가 모든 사용자의 통합검색 결과 상단에 공식 사이트 카드로 자동 노출
- **실시간 미리보기 & 폼 검증**: 파비콘, 태그, 사이트 설명, 서브링크의 검색 결과 노출 형태를 실시간 미리보기로 확인 가능

### 6. 계정 관리 및 복구 (`find-id.html`, `find-password.html`, `signup.html`)
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
├── index.html          # 에듀버 메인 포털 & 통합검색
├── style.css           # 메인 포털 스타일시트
├── main.js             # 메인 포털 인터랙션, 통합검색 및 뉴스 카드 렌더링
├── webmaster.html      # 웹마스터 도구 (교육 사이트 검색 등록 관리)
├── news.html           # 에듀버 뉴스 메인
├── news-detail.html    # 뉴스 상세 기사 뷰어
├── news.js             # 뉴스 데이터 및 PocketBase 동기화 관리
├── mail.html           # 웹메일 클라이언트 화면
├── mail.css            # 웹메일 전용 스타일시트
├── mail.js             # 웹메일 송수신, 수신확인 및 리치에디터 로직
├── blog.html           # 블로그 메인 화면
├── blog-write.html     # 블로그 글쓰기 에디터
├── my-blog.html        # 내 블로그 관리 및 포스트 뷰
├── blog.css            # 블로그 전용 스타일시트
├── blog.js             # 블로그 CRUD 및 인터랙션 로직
├── cafe.html           # 에듀버 커뮤니티 카페 홈
├── cafe-detail.html    # 카페 상세 게시판 및 게시글 뷰
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
