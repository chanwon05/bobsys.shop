# Railway 배포

React와 Spring Boot를 하나의 Docker 서비스로 배포합니다. Java 21을 사용합니다.
MySQL은 같은 Railway 프로젝트의 별도 서비스로 생성합니다.

## 서비스 준비

1. Railway 로그인 후 프로젝트를 만들고 MySQL 서비스를 추가합니다.
2. 앱 서비스를 생성하고 이 폴더(`bobsys`)를 빌드 루트로 지정합니다.
   저장소가 상위 폴더 기준이면 Root Directory는 `/bobsys`입니다.
   GitHub에 연결하지 않는 경우 Railway CLI에서 로그인/프로젝트 연결 후
   `bobsys` 폴더에서 `railway up`으로 업로드할 수 있습니다.
3. 앱 서비스에 Volume을 추가하고 `/data`에 마운트합니다.
   MySQL 서비스의 데이터 볼륨과는 별개이며, 앱의 업로드 이미지를 보관합니다.
4. 앱 Variables에 다음 값을 설정합니다. DB 서비스 이름이 `MySQL`인 예시입니다.

```text
SPRING_PROFILES_ACTIVE=railway
BOBSYS_DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
BOBSYS_DB_USERNAME=${{MySQL.MYSQLUSER}}
BOBSYS_DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
APP_JWT_SECRET=<32바이트 이상 난수의 Base64 문자열>
```

서비스 변수 선택기로 실제 MySQL 변수명을 확인합니다. 공개 TCP 주소 대신 내부 주소를 사용합니다.
JWT 키는 한 번 생성해 비밀 변수에 저장하고 재배포 때도 유지합니다.
비밀번호와 키를 Git이나 Dockerfile에 넣지 않습니다.

## 배포 및 확인

- Dockerfile이 React 빌드, 백엔드 테스트, 실행 JAR 생성을 순서대로 수행합니다.
- Railway PORT를 사용하고 0.0.0.0에서 수신합니다.
- 배포 상태 검사는 `/index.html`입니다. DB 접속이나 스키마 초기화에 실패하면 앱이 시작되지 않습니다.
- Settings → Networking → Generate Domain으로 임시 HTTPS 주소를 만듭니다.
- `/`, `/admin`, `/portfolio`, 샘플 페이지 직접 접속 및 새로고침을 확인합니다.
- 인증 없이 관리자 API에 접근할 수 없는지 확인합니다.
- 상품/샘플/포트폴리오 이미지 업로드 후 재배포해도 이미지가 유지되는지 확인합니다.
- MySQL 및 앱 볼륨의 백업을 별도로 설정합니다. 볼륨은 백업을 대체하지 않습니다.

## 기존 데이터 이전

새 DB에는 기존 관리자 계정이 자동으로 복사되지 않습니다.
원본 DB를 백업하고 필요한 데이터(관리자 비밀번호 해시 포함)를 가져옵니다.
기존 이미지 데이터도 유지한다면 원본 업로드 파일을 앱 볼륨의 `/data/products`로 복사합니다.
현재는 Hibernate `ddl-auto=update`와 카테고리 제약 마이그레이션을 사용합니다.
기존 운영 DB를 직접 연결하기 전에 백업하고 새 DB에서 검증합니다.

## 도메인 전환

임시 주소에서 검증이 끝난 뒤 `bobsys.shop`과 필요한 `www` 주소를 Custom Domain에 추가합니다.
Railway에서 표시하는 DNS 레코드를 사용합니다. 루트 도메인의 CNAME 지원 여부에 따라
DNS 제공업체 변경이 필요할 수 있으므로 임의로 기존 A 레코드를 삭제하지 않습니다.
HTTPS 발급과 실제 사이트 동작 확인 후 기존 가비아 웹호스팅을 해지합니다.
도메인 등록은 유지합니다.

## 비용

Hobby는 사용량 과금입니다. 프로젝트 예산 알림과 사용량 제한을 확인합니다.
사용량 제한으로 서비스가 정지될 수 있으므로 운영 목표에 맞춰 설정합니다.
