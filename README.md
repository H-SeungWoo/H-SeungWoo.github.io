# Personal Records

레코드에서 네 가지 이야기로 이어지는 반응형 포트폴리오입니다. HTML/CSS/JavaScript로 만들었으며 빌드나 패키지 설치가 필요하지 않습니다.

## 미리 보기

이 폴더에서 `python -m http.server 4173`을 실행한 뒤 `http://localhost:4173`을 엽니다. `index.html`을 직접 열어도 기본 화면을 볼 수 있습니다.

## 내 이야기로 바꾸기

- `app.js` 상단의 `tracks`: 네 메뉴의 제목, 설명, 상세 내용. 현재 내용은 모두 명시적인 예시입니다.
- `index.html`: 홈 메뉴와 소개, 사이트 이름, 메타 설명.
- `style.css`의 `:root`: 배경, 글자, 강조 색상.
- 실제 내용 입력 후 `app.js`의 DEMO CONTENT 안내도 삭제하세요.

음악은 외부 음원 없이 Web Audio로 합성하는 짧은 반복 연주입니다. 각 트랙의 `notes`는 MIDI 음정입니다. 첫 메뉴 클릭 시 소리가 켜지며 상단 SOUND 버튼으로 끌 수 있습니다. 주소로 상세 화면에 직접 접속할 때는 SOUND 버튼을 눌러야 합니다. 탭을 숨기면 소리는 멈춥니다. 추후 보유한 음원으로 교체할 수 있습니다.

트랙 시간은 레코드 재킷 분위기를 위한 예시 표기입니다. 실제 음원 길이가 아닙니다. Google Fonts 연결이 불가능하면 시스템 글꼴을 사용합니다. 운영체제의 동작 줄이기 설정에서는 회전 및 화면 전환 애니메이션을 생략합니다.

## GitHub Pages 배포

저장소: https://github.com/H-SeungWoo/H-SeungWoo.github.io

공개 주소: https://h-seungwoo.github.io/

기존 저장소의 `main` 브랜치 기반 GitHub Pages 배포를 사용합니다. 사이트 파일을 `main`에 반영하면 GitHub의 `pages build and deployment`가 실행됩니다. 별도 워크플로 파일은 필요하지 않습니다. **Settings → Pages**에서 배포 원본을 확인할 수 있습니다.

모든 사이트 파일 경로가 상대 경로이므로 `https://사용자명.github.io/저장소명/` 형식에서도 동작합니다. 실제 공개 배포에는 사용자의 저장소와 GitHub 인증이 필요합니다.
