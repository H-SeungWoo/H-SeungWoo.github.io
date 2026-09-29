# Personal Records — The Listening Room

공개 사이트: https://h-seungwoo.github.io/
저장소: https://github.com/H-SeungWoo/H-SeungWoo.github.io

## 구성

- `index.html`: 홈, 네 가지 트랙 메뉴, 상세 화면, 음악 및 회전 제어.
- `style.css`: 차콜·월넛·앰버 색상과 데스크톱/모바일 레이아웃.
- `scene.js`: Three.js 0.180.0으로 만든 레코드, 월넛 턴테이블, 금속 톤암, 조명·그림자·카메라 전환. 모델과 텍스처는 코드에서 생성됩니다.
- `app.js`: 콘텐츠와 주소 기반 탐색, 전면 앨범 속지 전환.
- `audio.js`: 페이지 이동과 독립적인 단일 루프 배경음악.
- `motion.js`: Anime.js 4.2.2 공통 로더.

## 실행

`python -m http.server 4173` 실행 후 http://localhost:4173 을 엽니다. 3D 모듈을 사용하므로 파일을 더블 클릭하는 대신 로컬 서버에서 확인하세요. 별도 빌드가 필요하지 않습니다.

Three.js는 버전이 고정된 jsDelivr CDN에서 불러오며 글꼴은 Google Fonts를 사용합니다. 네트워크나 WebGL을 사용할 수 없으면 정적인 레코드와 시스템 글꼴로 표시됩니다. 메뉴와 본문은 3D가 없어도 이용할 수 있습니다.

## 디자인과 동작

처음부터 레코드가 회전하며, 사선 구도에서 2.6초 동안 수직 탑뷰로 카메라가 이동합니다. 메뉴 선택 시 Anime.js로 전면 앨범 속지를 펼칩니다. 홈 복귀 시 완료된 탑뷰를 유지합니다. 세부 구조 선택 근거와 5개 후보는 DESIGN-DECISIONS.md에 기록되어 있습니다.

음악은 단일 AudioBufferSource를 루프로 재생하며 메뉴 이동이 재생 위치나 소스를 초기화하지 않습니다. 진입 즉시 재생을 시도하지만, 브라우저가 자동재생을 차단하면 첫 클릭·터치·키 입력에서 시작합니다. SOUND 버튼은 음소거만 전환하며 현재 위치를 유지합니다. 운영체제나 브라우저 자체의 오디오 중지는 웹사이트가 강제로 해제하지 않습니다.

운영체제의 동작 줄이기 설정에서는 즉시 탑뷰가 표시되고 화면 전환 애니메이션은 생략됩니다. 숨겨진 탭에서는 3D 렌더링을 멈추며 오디오 소스는 페이지 이동과 무관하게 유지됩니다. WebGL 또는 애니메이션 CDN 실패 시에도 본문과 메뉴는 사용할 수 있습니다.
## 콘텐츠 교체

`app.js` 상단 `tracks` 객체에서 제목, 짧은 설명, 상세 항목을 수정합니다. 지금은 전공과 GitHub 계정 외에는 예시입니다. 프로젝트 정리 Markdown을 받으면 실제 콘텐츠로 교체할 수 있습니다. 파일을 폴더에 넣는 것만으로 자동 반영되지는 않습니다.

현재 배경음은 직접 합성한 임시 재즈풍 연주이며 실제 재즈 녹음 음원이 아닙니다. 공개 사용이 허용된 음원으로 추후 교체할 수 있습니다.

## 배포

기존 저장소 `main` 브랜치의 GitHub Pages 자동 배포를 사용합니다. 사이트 파일과 README 변경을 저장소에 반영하면 `pages build and deployment`가 실행됩니다. 파일 경로는 상대 경로입니다. 변경 시 index.html의 리소스 버전 쿼리도 갱신해 브라우저 캐시를 방지하세요.


## LP collection (2026-09)
- Five albums live in `albums.js`: identity, campus, Unreal/Blender, web, AI.
- Add an album to that array to extend the three-column cabinet; its fixed slot is empty while selected.
- Each `entries` item is a slide: `[small label, title, body]`. The UI supports arrow buttons, left/right keys, and mouse wheel.
- Shelf: labeled left-side handle; native modal dialog, Escape, outside click, focus return; walnut cabinet and brass plaques.
- Initial record is stationary. PLAY RECORD or choosing another LP starts rotation and requests audio. Album navigation never recreates the soundtrack.
- Reduced motion keeps the camera in its top view and removes animated transitions. Content remains accessible without Three.js.

## Supplied visual assets
Original PNGs remain locally in `assets/collection`. Published WebP copies use the same artwork, resized and compressed for delivery. CSS positions transparent margins without altering the originals.
- Cabinet: supplied image 2; handle: 3; brass plaque: 4.
- Album covers: introduction 5 (confirmed), campus 6, Unreal/Blender 7, web 8, AI 9.
- Sprite sheets are reserved for components without individual assets; no alternative covers were substituted.
- Titles and plaques remain live HTML text. Existing 3D camera entrance and continuous soundtrack are retained.
