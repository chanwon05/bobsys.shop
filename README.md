# 밥시스 (BOBSYS)

인쇄물 가격과 샘플, 홈페이지 제작 안내 및 포트폴리오를 제공하는 웹사이트입니다.
관리자는 상품·샘플·포트폴리오·공지사항을 등록하고 관리할 수 있습니다.

- 사이트: [bobsys.shop](https://bobsys.shop)
- 프론트엔드: React 19, React Router 7, Vite 8
- 백엔드: Java 21, Spring Boot 4.1.2, Spring Security, Spring Data JPA
- 데이터베이스: MySQL / 테스트: H2
- 배포: Docker, Railway

## 주요 기능

| 구분 | 기능 |
| --- | --- |
| 상품·가격 | 페이지별 상품 목록, 기준 수량, 기본·단면·양면 가격 표시 |
| 샘플 | 명함·현수막·전단/포스터·스티커 샘플 및 카테고리 필터 |
| 홈페이지 제작 | 제작 유형별 가격 안내 |
| 포트폴리오 | 이미지·설명·외부 사이트 링크 |
| 관리자 | 상품·샘플·포트폴리오·샘플 카테고리·공지사항 관리, 사용자 목록 조회 |
| 광고 배너 | 이전·다음 버튼 및 좌우 방향키로 전환 |

상품 등록은 **페이지만 선택**하며, 가격 페이지에는 카테고리 필터가 없습니다.
샘플 등록은 **페이지와 카테고리를 선택**합니다. 샘플은 가격 없이 저장하며,
공개 샘플 화면에는 이름·설명·가격을 표시하지 않습니다.

## 디렉터리

```text
backend/
  src/main/java/        API, 인증, 엔티티, 서비스
  src/main/resources/   로컬·Railway 설정
  src/test/             H2 기반 백엔드 테스트
  tools/PasswordHash.java
frontend/
  src/components/       공통 UI, 관리자 폼
  src/pages/            공개·관리자 페이지
  src/services/         API 요청 및 인증 토큰 관리
  public/images/        배너 등 정적 이미지
Dockerfile              프론트·백엔드 통합 빌드
railway.toml            Railway 빌드·상태 검사 설정
RAILWAY.md              배포 상세 안내
```

아래 명령은 이 README가 있는 저장소 루트를 기준으로 합니다.

## 로컬 실행

### 준비

- JDK 21과 `JAVA_HOME` 설정
- Node.js 24 및 npm (Docker 빌드 환경과 동일한 주 버전)
- 로컬 MySQL 서버

MySQL에 개발용 데이터베이스를 생성합니다.

```sql
CREATE DATABASE IF NOT EXISTS bobsys_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

기본 연결 주소는 `localhost:3306/bobsys_db`, 사용자는 `root`입니다.
다른 계정을 쓰면 `SPRING_DATASOURCE_USERNAME` 환경변수로 덮어쓸 수 있습니다.
테이블은 백엔드 시작 시 Hibernate의 `ddl-auto=update`로 생성·갱신됩니다.

### 백엔드 — PowerShell

```powershell
cd backend
$dbCredential = Get-Credential -UserName root -Message '로컬 MySQL 계정 입력'
$env:SPRING_DATASOURCE_USERNAME = $dbCredential.UserName
$env:BOBSYS_DB_PASSWORD = $dbCredential.GetNetworkCredential().Password
.\gradlew.bat bootRun
```

기본 주소는 `http://127.0.0.1:8080`입니다. 8080 포트를 사용 중인 이전 서버가 있다면
중지한 뒤 실행합니다. IntelliJ에서 실행할 때는 Run Configuration의 환경변수에
`BOBSYS_DB_PASSWORD`를 설정합니다.

Spring Boot는 `.env` 파일을 자동으로 읽지 않습니다. 환경변수는 앱을 시작하는
터미널이나 IDE에 설정해야 합니다.

### 프론트엔드 — 별도 터미널

```powershell
cd frontend
npm ci
npm run dev
```

터미널에 표시되는 Vite 주소로 접속합니다. 기본 주소는 `http://localhost:5173`입니다.
개발 서버는 `/api` 요청을 로컬 백엔드의 8080 포트로 전달합니다.

### 관리자 계정

`/admin`에서 로그인합니다. 기본 관리자 계정은 자동 생성되지 않습니다.
기존 계정을 이전하거나, DB의 `users`에 `username`, `name`, BCrypt로 생성한
`password_hash`, `role = 'ADMIN'`을 갖는 계정을 별도로 준비해야 합니다.
비밀번호 평문을 `password_hash`에 저장하면 안 됩니다.

새 비밀번호의 BCrypt 해시는 `backend` 폴더의 대화형 PowerShell에서 생성할 수 있습니다.

```powershell
$hashClasspath = (.\gradlew.bat -q passwordHashClasspath | Select-Object -Last 1).Trim()
java --class-path "$hashClasspath" tools/PasswordHash.java
```

실제 비밀번호·해시·운영 DB 덤프는 저장소에 올리지 않습니다.
로그인 토큰의 유효기간은 30분이며, 로컬에서 `APP_JWT_SECRET`을 지정하지 않으면
서버 재시작 후 기존 토큰이 무효화됩니다.

## 환경변수

| 이름 | 용도 |
| --- | --- |
| `BOBSYS_DB_PASSWORD` | 로컬·Railway DB 비밀번호 |
| `SPRING_PROFILES_ACTIVE` | Railway에서 `railway`로 설정 |
| `BOBSYS_DB_URL` | Railway 프로필의 JDBC 연결 주소 |
| `BOBSYS_DB_USERNAME` | Railway 프로필의 DB 사용자 |
| `APP_JWT_SECRET` | 32바이트 이상 난수를 Base64로 인코딩한 JWT 서명 키. 운영에서 설정 |
| `PORT` | Railway 프로필의 서버 포트, 기본값 8080 |
| `VITE_API_BASE_URL` | 프론트 빌드 시 API 주소 변경. 기본값 `/api` |

`BOBSYS_DB_URL`과 `BOBSYS_DB_USERNAME`은 Railway 프로필에서 사용합니다.
로컬 기본 프로필의 연결 주소 변경은 `SPRING_DATASOURCE_URL`을 사용합니다.

## 검증

백엔드 테스트는 운영 MySQL 대신 전용 H2 메모리 DB를 사용합니다.

```powershell
cd backend
.\gradlew.bat test
```

프론트엔드는 빌드와 ESLint로 검증합니다. 별도의 프론트 테스트 명령은 없습니다.

```powershell
cd frontend
npm run build
npm run lint
```

Windows에서는 OneDrive 파일 잠금 문제를 줄이기 위해 Gradle 빌드 결과를
`%LOCALAPPDATA%/bobsys-build/<프로젝트 식별값>/backend`에 생성합니다.

## Railway 배포

React 빌드 결과를 Spring Boot의 정적 리소스에 포함해 **하나의 앱 서비스**로 배포합니다.
MySQL은 같은 Railway 프로젝트의 별도 서비스로 실행합니다.

1. GitHub 저장소를 연결하고 저장소 루트의 `Dockerfile`로 빌드합니다.
2. MySQL 서비스를 추가하고 앱의 DB 연결 환경변수를 설정합니다.
3. 앱에 이미지 보관용 Volume을 추가하고 `/data`에 마운트합니다.
4. `SPRING_PROFILES_ACTIVE=railway` 및 `APP_JWT_SECRET`을 설정합니다.
5. 공개 도메인의 대상 포트를 앱 포트에 맞추고, 배포 상태와 실제 페이지를 확인합니다.

이 저장소는 루트에 `Dockerfile`이 있으므로 Root Directory는 저장소 루트를 사용합니다.
앱 업로드 이미지는 `/data/products`에 저장합니다. 로컬에서는 `backend`에서 실행할 경우
`backend/uploads/products`에 저장합니다. 정적 배너는 `frontend/public/images`에 있습니다.

GitHub 자동 배포가 연결된 브랜치에 push하면 새 빌드가 시작됩니다.
사이트 반영은 빌드와 배포가 성공한 뒤 완료됩니다. 로컬 DB와 업로드 파일은
Git push로 운영 환경에 이전되지 않습니다.

환경변수 예시와 데이터 이전·도메인 설정은 [Railway 배포 안내](RAILWAY.md)를 참고하세요.
