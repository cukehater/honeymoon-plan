---
name: 허니문 플래너
description: 포르투·바르셀로나 신혼여행을 두 사람이 함께 보는 여행 수첩
colors:
  azulejo-cobalt: "#1f4fa3"
  azulejo-cobalt-soft: "#e7eefb"
  gracia-ochre: "#9b5d10"
  gracia-ochre-soft: "#fbf0df"
  brick-warning: "#a3361f"
  brick-warning-soft: "#fbeae5"
  olive-done: "#2a7447"
  paper: "#f5f7fa"
  card-white: "#ffffff"
  ink: "#1b2333"
  slate-muted: "#5d6779"
  hairline: "#dde2ea"
  azulejo-cobalt-night: "#7ea6ec"
  azulejo-cobalt-soft-night: "#1a2740"
  gracia-ochre-night: "#e3a556"
  gracia-ochre-soft-night: "#2e2414"
  brick-warning-night: "#f08b73"
  brick-warning-soft-night: "#331c17"
  olive-done-night: "#6fcf97"
  paper-night: "#11151d"
  card-night: "#181e29"
  ink-night: "#e7ebf2"
  slate-muted-night: "#9aa3b4"
  hairline-night: "#2a3242"
typography:
  display:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "clamp(28px, 8vw, 42px)"
    fontWeight: 700
    lineHeight: 1.3
  headline:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  numeric:
    fontFamily: "Montserrat, Pretendard, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "'tnum' 1"
rounded:
  tag: "4px"
  control: "8px"
  card: "10px"
  pill: "9999px"
spacing:
  gutter: "16px"
  stack: "12px"
  section: "32px"
  card-y: "14px"
  card-x: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 16px"
  button-outline:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
  button-danger:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.brick-warning}"
    rounded: "{rounded.control}"
    height: "44px"
  chip:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  card-total:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  input:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
  date-badge-porto:
    backgroundColor: "{colors.azulejo-cobalt-soft}"
    textColor: "{colors.azulejo-cobalt}"
    rounded: "{rounded.tag}"
    typography: "{typography.numeric}"
    padding: "2px 8px"
  date-badge-barcelona:
    backgroundColor: "{colors.gracia-ochre-soft}"
    textColor: "{colors.gracia-ochre}"
    rounded: "{rounded.tag}"
    typography: "{typography.numeric}"
    padding: "2px 8px"
  tag-booking-required:
    backgroundColor: "{colors.brick-warning-soft}"
    textColor: "{colors.brick-warning}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
  tab-bar:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.slate-muted}"
    height: "56px"
  fab-add-expense:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
---

# Design System: 허니문 플래너

## Overview

**Creative North Star: "두 사람의 여행 수첩"**

하얀 종이 위에 시각과 메모를 차분히 적어 둔 수첩입니다. 화면은 차분하고 정돈되어 있고, 길 위에서 급하게 열어 봐도 무엇을 먼저 볼지 바로 알 수 있습니다. 장식 대신 여백, 얇은 선, 면의 톤으로 구조를 만듭니다. 색은 정보에 쓰입니다. 포르투와 바르셀로나를 구분하는 두 도시 색, 주의와 완료를 알리는 두 신호색이 전부입니다.

이 수첩은 `docs/reference/honeymoon.html`에서 출발했습니다. 그 일정표의 색 토큰, 날짜 배지, 시각과 제목의 2열 타임라인, 주의사항 띠를 그대로 이어받고, 휴대폰 앱에 필요한 하단 탭 바, 떠 있는 "지출 추가" 버튼, 큰 숫자 입력을 더했습니다. 라이트와 다크를 모두 지원하며 다크는 밤의 종이(짙은 남색 면)에 같은 구조를 옮깁니다.

**Key Characteristics:**
- 종이처럼 평평한 면과 1px 선. 그림자는 떠 있는 버튼 하나에만 있습니다.
- 도시 색은 구분에만 씁니다(포르투 코발트, 바르셀로나 오커).
- 숫자와 시각은 자릿수를 맞춰(tabular figures) 표처럼 읽힙니다.
- 모바일 우선, 한 손 조작. 모든 터치 영역 44px 이상.
- 한글은 어절 단위로 줄을 바꿉니다.

## Colors

차가운 종이 바탕에 짙은 잉크, 도시를 가르는 코발트와 오커, 그리고 주의(벽돌색)와 완료(올리브색) 두 신호로 이루어진 절제된 팔레트입니다.

### Primary
- **Azulejo Cobalt** (`azulejo-cobalt`): 포르투의 색이자 링크와 포커스 링의 색. 포르투 날짜 배지와 도시 구분선, 포르투 쪽 칩 테두리, 텍스트 링크, 키보드 포커스 윤곽선에 씁니다. 연한 짝 `azulejo-cobalt-soft`는 포르투 날짜 배지와 식사 태그의 바탕입니다.

### Secondary
- **Gràcia Ochre** (`gracia-ochre`): 바르셀로나의 색. 바르셀로나 날짜 배지, 도시 구분선, "예상" 상태 표시에 씁니다. 연한 짝 `gracia-ochre-soft`는 그날의 핵심 일정(강조 항목) 바탕이기도 합니다. 참고 HTML의 `#b06a12`에서 연한 바탕 위 글자 대비 4.5:1을 맞추려고 명도만 낮췄습니다.

### Tertiary
- **Brick Warning** (`brick-warning`): 주의와 위험. 날짜별 주의사항 띠, "예약 필요" 태그, 마감일, 예산·면세 한도 초과, 오류 메시지, 삭제 버튼.
- **Olive Done** (`olive-done`): 완료와 진행. 체크리스트 진행 막대, 체크한 사람 표시, "예약 완료"와 "결제 완료", 저장 성공 메시지.

### Neutral
- **Paper** (`paper`): 화면 바탕.
- **Card White** (`card-white`): 카드, 입력칸, 탭 바 등 한 단 올라온 면.
- **Ink** (`ink`): 본문 글자, 주 버튼과 선택된 칩, 총 예상 경비 타일의 면.
- **Slate Muted** (`slate-muted`): 설명, 보조 라벨, 비활성 탭.
- **Hairline** (`hairline`): 1px 테두리, 목록 구분선, 진행 막대의 빈 부분.

모든 색에는 `-night` 짝이 있으며 `prefers-color-scheme: dark`에서 같은 역할로 바뀝니다.

### Named Rules
**The City Color Rule.** 코발트와 오커는 도시를 구분할 때(그리고 코발트는 링크·포커스에)만 씁니다. 장식이나 강조용으로 끌어 쓰지 않습니다.

**The Two Signals Rule.** 벽돌색은 "주의·초과·오류", 올리브색은 "완료·진행"만 뜻합니다. 같은 의미에는 늘 같은 색, 그리고 색만으로 뜻을 전하지 않도록 글자 라벨을 함께 둡니다.

**The 4.5 Rule.** 글자와 그 바탕의 대비는 라이트·다크 모두 4.5:1 이상입니다. 연한 바탕(-soft) 위 도시 색 글자도 예외가 아닙니다.

## Typography

**Display Font:** Montserrat (영문·숫자), Pretendard (한글)
**Body Font:** Montserrat + Pretendard (같은 가족)
**Label/Mono Font:** 별도 글꼴 없음. 숫자는 같은 가족에 tabular figures를 켭니다.

**Character:** Montserrat의 기하학적인 영문·숫자와 Pretendard의 단정한 한글이 한 줄 안에서 섞입니다. 굵기(400·600·700)와 크기로만 위계를 만듭니다.

### Hierarchy
- **Display** (700, clamp(28px, 8vw, 42px), 1.3): 홈의 "출발까지 D-10" 한 줄에만 씁니다.
- **Headline** (700, 28px, 1.3): 각 화면의 제목(일정, 경비, 예약…), 여행 중 "여행 n일차".
- **Title** (700, 17–20px, 1.4): 구역 제목, 하루 일정 제목, 체크리스트 그룹 이름.
- **Body** (400, 15px, 1.65): 일정 항목 제목(600), 카드 내용.
- **Body Small** (400, 14px, 1.6): 일정 설명, 날짜 메모, 주의사항 본문. 보조 색(slate-muted).
- **Label** (600, 12px): 타일 라벨, 태그(11px), "먼저 할 것" 같은 짧은 표시.
- **Numeric** (400, 13px, tnum): 일정 시각, 날짜 배지. 금액은 같은 설정으로 18–40px까지 키워 씁니다.

### Named Rules
**The Tabular Rule.** 금액, 시각, 날짜, 진행 수(1/34)는 항상 tabular figures로 씁니다. 세로로 늘어선 숫자는 자릿수가 맞아야 합니다.

**The One Family Rule.** 글꼴은 Montserrat와 Pretendard 한 쌍뿐입니다. 제목도 숫자도 같은 가족을 쓰고, 다른 글꼴을 들이지 않습니다.

**The Keep-All Rule.** 한글은 어절 단위로 줄을 바꿉니다(`word-break: keep-all`). 예약번호처럼 띄어쓰기 없는 긴 문자열만 중간에서 끊습니다.

## Layout

한 줄 세로 흐름입니다. 콘텐츠는 가운데 최대 768px 기둥에 놓이고, 좌우 여백은 16px(`gutter`)입니다. 구역 사이는 32px(`section`), 구역 안 요소 사이는 12px(`stack`)입니다. 데스크톱에서도 같은 기둥을 유지합니다.

- **하단 탭 바**: 화면 아래 고정, 높이 56px에 아이폰 홈 표시줄 영역(`env(safe-area-inset-bottom)`)을 더합니다. 본문 아래에는 탭 바와 떠 있는 버튼을 피할 여백(약 144px + safe-area)을 둡니다.
- **떠 있는 "지출 추가" 버튼**: 탭 바 위 오른쪽 16px. 지출 입력·수정 화면에서는 숨깁니다.
- **타임라인**: 시각 열 52px(640px 이상에서 64px)과 내용 열의 2열 격자.
- **요약 타일**: 2열 격자, 간격 12px.
- **날짜 칩 메뉴**: 가로로 스크롤되는 띠, 화면 위에 붙습니다.
- 375px 폭에서 가로 스크롤이 생기지 않습니다.

## Elevation & Depth

평평합니다. 깊이는 면의 톤(paper 위 card-white)과 1px hairline으로 만듭니다. 그림자는 화면 위에 떠서 다른 내용을 덮는 "지출 추가" 버튼 하나에만 있습니다.

### Shadow Vocabulary
- **Floating Action** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): 떠 있는 "지출 추가" 버튼 전용.

### Named Rules
**The Paper Rule.** 카드, 타일, 입력칸, 탭 바는 그림자 없이 테두리와 면의 톤으로만 구분합니다. 그림자는 내용 위에 실제로 떠 있는 요소에만 씁니다.

## Shapes

부드럽지만 단단한 모서리입니다. 태그와 날짜 배지는 4px(`tag`), 버튼과 입력칸은 8px(`control`), 카드와 타일은 10px(`card`), 선택 칩과 떠 있는 버튼은 완전한 알약형(`pill`)입니다. 테두리는 늘 1px hairline이고, 예외는 두 가지입니다. 날짜 주의사항의 왼쪽 3px 벽돌색 띠와 수하물 그룹 카드의 벽돌색 테두리입니다. 둘 다 참고 HTML에서 이어받았습니다.

## Components

### Buttons
종이 위에 찍힌 도장처럼 단정한 버튼입니다.
- **Shape:** 8px 모서리, 높이 44px 이상.
- **Primary:** 잉크 면에 종이색 글자, 굵게. 화면당 하나(저장, 들어가기, 추가).
- **Outline:** 흰 면에 hairline 테두리. 복사, 숨기기, 다시 보이기 같은 보조 동작.
- **Danger:** 흰 면에 벽돌색 테두리와 글자. 삭제 전용, 누르면 한 번 더 확인합니다.
- **Loading / Disabled:** 글자가 "저장 중…"으로 바뀌고 불투명도 60%. 실패하면 입력값을 유지한 채 오류 문구를 아래에 둡니다.
- **Focus:** 2px 코발트 윤곽선, 2px 간격.

### Chips
- **Style:** 알약형, 흰 면, hairline 테두리, 높이 44px. 지출 입력의 항목·결제수단·결제한 사람 선택에 씁니다.
- **State:** 선택되면 잉크 면에 종이색 글자. 실제 라디오 입력을 숨겨 두어 키보드로 고를 수 있고, 포커스는 칩 전체에 코발트 윤곽선으로 보입니다.
- **날짜 칩:** 일정 화면 위쪽 띠. 테두리 색이 도시 색(코발트 40% / 오커 45% 혼합)입니다.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** card-white(다크는 card-night).
- **Shadow Strategy:** 없음(The Paper Rule).
- **Border:** 1px hairline.
- **Internal Padding:** 위아래 14px, 좌우 16px.
- **Total Tile:** 경비 요약의 "총 예상 경비" 타일만 잉크 면을 써서 다른 세 타일보다 한 단계 무겁게 보입니다.

### Inputs / Fields
- **Style:** 흰 면, 1px hairline, 8px 모서리, 높이 44px, 글자 16px(아이폰 확대 방지).
- **Amount Field:** 지출 금액만 예외로, 테두리 없이 아래 2px 선과 40px 숫자. 포커스되면 선이 코발트로 바뀝니다.
- **Error:** 필드 아래 벽돌색 문구(role="alert"). 입력값은 지우지 않습니다.

### Navigation
- **Tab Bar:** 홈·일정·경비·체크리스트·예약 다섯 칸, 글자만 씁니다(13px). 기본은 slate-muted, 손가락이나 마우스를 올리면 잉크. 활성 탭은 잉크 굵은 글자와 위쪽 2px 잉크 막대.

### Timeline Item
- 시각(numeric, slate-muted) + 제목(600) + 설명(body-small) + 태그. 항목 사이 1px hairline.
- **강조 항목**은 오커 연한 면에 8px 모서리로 감싸고 앞뒤 구분선을 지웁니다.
- **태그**(11px, 600, 4px 모서리): 예약 필요(벽돌색), 예약 완료(올리브), 식사(그 도시의 연한 색).
- 항공 항목은 제목 앞에 ✈를 둡니다.

### Day Alert
- 벽돌색 연한 면, 왼쪽 3px 벽돌색 띠, 오른쪽만 8px 모서리. 굵은 제목 + 본문을 한 문단으로.

### Date Badge
- 날짜와 n일차를 숫자 글꼴로 적은 작은 배지. 포르투는 코발트, 바르셀로나는 오커의 연한 면과 진한 글자.

## Do's and Don'ts

### Do:
- **Do** 도시를 구분할 때 포르투는 `azulejo-cobalt`, 바르셀로나는 `gracia-ochre`를 씁니다.
- **Do** 금액·시각·날짜에 tabular figures를 켭니다.
- **Do** 카드와 타일은 1px hairline과 10px 모서리로, 그림자 없이 만듭니다.
- **Do** 모든 누를 수 있는 요소를 44px 이상으로, 하단 고정 요소에는 safe-area를 더합니다.
- **Do** 상태를 색과 글자로 함께 알립니다("예약 필요", "한도 초과").

### Don't:
- **Don't** 코발트·오커를 장식이나 일반 강조에 쓰지 않습니다(The City Color Rule).
- **Don't** 떠 있는 "지출 추가" 버튼 외의 요소에 그림자를 넣지 않습니다(The Paper Rule).
- **Don't** Montserrat·Pretendard 외의 글꼴을 들이지 않습니다.
- **Don't** 벽돌색을 주의·초과·오류가 아닌 곳에, 올리브색을 완료·진행이 아닌 곳에 쓰지 않습니다.
- **Don't** 연한 바탕 위에 대비 4.5:1 미만의 글자를 두지 않습니다.
