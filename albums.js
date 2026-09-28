export const albums = [
 {id:'about',title:'자기소개',english:'Introduce myself',era:'PERSONAL RECORD',color:'#ac8058',cover:'Hello,\nI am.',tag:'IDENTITY / CONTACT',entries:[['INTRODUCE MYSELF','한승우 · H-SeungWoo','사용자 경험을 생각하고, 그 경험이 동작하는 구조를 만듭니다.'],['EDUCATION','ICT융합학부 · 미디어 테크놀로지전공','배우고, 만들고, 다시 질문합니다. 학력과 이력, 나를 소개하는 이야기가 이곳에 담깁니다.'],['LET’S CONNECT','다음 이야기를 함께 만들어요','새로운 경험과 함께 만드는 일에 관심이 있습니다. GitHub에서 나의 작업을 만나보세요.']]},
 {id:'campus',title:'대학시절',english:'Years of curiosity',era:'2019 — 2026',color:'#7c8970',cover:'Stay\ncurious.',tag:'ICT융합학부 및 학부연구생',entries:[['MY MAJOR','배움이 나의 언어가 되기까지','ICT융합학부 미디어 테크놀로지전공. 전공과 학부연구생 생활의 경험을 모아 두는 앨범입니다.'],['ON CAMPUS','강의실 밖에서도 계속되는 배움','수업과 연구, 함께 만든 작업을 이곳에서 소개할 예정입니다.'],['LOOKING BACK','배우고, 다시 질문하고','학교생활을 통해 달라진 생각과 앞으로 탐구할 주제를 기록합니다.']]},
 {id:'unreal',title:'언리얼엔진 & 블렌더',english:'Worlds in the making',era:'2024 — 2025',color:'#857895',cover:'Other\nworlds.',tag:'UNREAL ENGINE / BLENDER'},
 {id:'web',title:'웹서비스',english:'Ideas, made tangible',era:'2026 —',color:'#64838a',cover:'Make it\nwork.',tag:'WEB / BACKEND'},
 {id:'ai',title:'AI',english:'A little beyond',era:'2026 —',color:'#b27555',cover:'What\nif?',tag:'AI / EXPERIMENTS'}
];
const projectEntries=[['PROJECT NOTES','생각을 실제로 만드는 과정','프로젝트의 출발점과 해결하려던 문제를 소개할 공간입니다. 상세 내용은 곧 채워집니다.'],['BEHIND THE WORK','선택과 시도, 그리고 발견','담당 역할과 구현 과정, 가장 어려웠던 문제와 해결 경험을 담을 예정입니다.'],['NEXT CHAPTER','계속 만들어 가는 중','결과와 배운 점, 다음 시도를 기록하는 공간입니다.']];
albums.forEach((album,index)=>{album.number=String(index+1).padStart(2,'0');album.entries??=projectEntries});
