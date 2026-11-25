"use strict";

// 서버·라이브러리 없이 실행되는 교육용 예제입니다. 사진 자동 분류는 하지 않습니다.
// AI 확장 시: 별도 서버에서 사진을 분류해 후보 ID를 반환받고, 사용자가 최종 확인하게 하세요.
// API 비밀 키는 이 브라우저 코드에 넣지 마세요.
const CASES = [
  { id: "straw", name: "빨대", animal: "바다거북", label: "실제 구조 사례", title: "거북이의 코에 박힌 빨대",
    description: "2015년 코스타리카에서 연구진이 바다거북의 콧속에 박힌 플라스틱 빨대를 제거했습니다. 한 번 쓰고 버린 작은 물건이 동물에게 직접적인 상처를 줄 수 있습니다.",
    disposal: "작고 가는 플라스틱 빨대는 재활용 선별이 어렵습니다. 지역 안내에 따라 일반쓰레기로 배출하세요.", alternative: "빨대가 필요하지 않을 때는 받지 않기. 필요하다면 안전하게 사용할 수 있는 다회용 빨대를 선택해요.",
    source: "https://storiesdev.marcomm.tamu.edu/news/2015/11/18/the-turtle-with-a-straw-in-its-nose-the-story-behind-the-viral-video/", sourceName: "Texas A&M · 바다거북 구조 사례" },
  { id: "bag", name: "비닐봉지", animal: "바다거북", label: "알려진 피해 유형", title: "먹이인 줄 알았던 비닐봉지",
    description: "바다거북은 물에 떠다니는 비닐과 플라스틱 조각을 먹이로 착각해 삼킬 수 있습니다. 삼킨 쓰레기는 건강과 생존을 위협합니다.",
    disposal: "비우고 이물질을 제거한 비닐은 지역 비닐류 수거 기준을 확인해 배출해요. 오염을 제거할 수 없다면 일반쓰레기로 배출하세요.", alternative: "접이식 장바구니를 가방에 넣어 두고, 작은 물건은 비닐봉지 없이 받아요.",
    source: "https://www.fisheries.noaa.gov/feature-story/what-can-you-do-help-sea-turtles", sourceName: "NOAA Fisheries · 바다거북과 플라스틱" },
  { id: "bottle", name: "페트병", animal: "해양 생물", label: "알려진 피해 유형", title: "사라지지 않고, 작아지는 플라스틱",
    description: "바다에 흘러든 플라스틱 병은 시간이 지나며 작은 조각으로 부서질 수 있습니다. 이런 플라스틱 조각도 해양 생물에게 삼킴의 위험을 남깁니다.",
    disposal: "생수·음료용 무색 투명 페트병은 비우고 헹군 뒤 라벨을 떼어 별도 배출해요. 다른 용도·재질의 용기는 해당 분리배출 기준을 확인하세요.", alternative: "외출할 때 물을 담은 개인 물병을 챙기고, 가능한 곳에서 물을 다시 채워요.",
    source: "https://marinedebris.noaa.gov/what-marine-debris/plastic", sourceName: "NOAA Marine Debris · 플라스틱" },
  { id: "line", name: "낚싯줄", animal: "바다거북 · 해양 포유류", label: "알려진 피해 유형", title: "몸을 조여 오는 보이지 않는 줄",
    description: "버려진 낚싯줄과 어구는 바다거북이나 해양 포유류의 몸에 얽힐 수 있습니다. 얽힌 동물은 움직이거나 먹이를 찾기 어려워지고, 심한 상처를 입기도 합니다.",
    disposal: "줄이 흩어지지 않게 모아 낚시터 전용 수거함을 이용해요. 전용 수거함이 없다면 지역 처리 기준을 확인하세요. 바늘은 찔리지 않도록 별도 보호해요.", alternative: "낚시를 마치면 내 줄과 장비를 모두 회수하고 주변에 남은 어구가 없는지 확인해요.",
    source: "https://www.fisheries.noaa.gov/insight/entanglement-marine-life-risks-and-response", sourceName: "NOAA Fisheries · 해양 생물 얽힘 피해" },
  { id: "cigarette", name: "담배꽁초", animal: "해양 생물의 서식 환경", label: "해양 쓰레기 알아보기", title: "작은 꽁초에도 플라스틱이 있어요",
    description: "대부분의 담배 필터에는 쉽게 분해되지 않는 플라스틱 계열의 소재가 들어 있습니다. 바닥에 버린 꽁초도 빗물과 배수로를 통해 바다로 흘러들 수 있습니다.",
    disposal: "불씨를 완전히 끄고 지정된 꽁초 수거함이나 지역 기준에 맞는 일반쓰레기로 배출해요. 배수구나 화단에 버리지 마세요.", alternative: "쓰레기를 길에 버리지 않는 습관을 실천하고, 필요한 경우 불씨가 꺼진 꽁초를 담을 휴대용 재떨이를 사용해요.",
    source: "https://oceanservice.noaa.gov/facts/most-common-ocean-litter.html", sourceName: "NOAA · 해양 쓰레기와 담배 필터" }
];
const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = "ocean-care-records-v1";
let selectedId = null;
let currentCase = null;
let photoUrl = null;
let photoRequest = 0;
let toastTimer;
let storageAvailable = true;
let records = readRecords();

function readRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(r => r && CASES.some(c => c.id === r.id) && typeof r.date === "string" && Number.isFinite(Date.parse(r.date))).filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i).map(r => ({id:r.id,date:r.date})) : [];
  } catch { storageAvailable = false; return []; }
}
function persistRecords() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); storageAvailable = true; }
  catch { storageAvailable = false; }
  renderCollection();
}
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => { $("#toast").hidden = true; }, 5000);
}

// 직접 작성한 설명용 SVG입니다. 실제 피해 사진으로 표시하지 않습니다.
function itemDrawing(id) {
  const drawings = {
    straw: '<path d="M19 52V22l17-12h15"/><path d="M27 52V26l12-8h12"/>',
    bag: '<path d="M17 13h9v13h14V13h9l5 42H12z"/><path d="M26 13c0-7 14-7 14 0"/>',
    bottle: '<path d="M26 7h14v10l8 10v28H18V27l8-10z"/><path d="M26 13h14M19 34h28M19 44h28"/>',
    line: '<path d="M8 21c0-18 38-18 38 0 0 15-27 19-27 5 0-11 19-10 19 0v20c0 16 20 16 20 0v-6l-7 5"/>',
    cigarette: '<path d="M8 34h48v14H8zM41 34v14M14 34v14"/><path d="M15 26c-12-13 12-10 0-23M27 26c-12-13 12-10 0-23"/>'
  };
  return drawings[id] || drawings.straw;
}
function itemIcon(id) { return `<svg viewBox="0 0 66 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${itemDrawing(id)}</svg>`; }
function oceanArt(id = null, dark = false) {
  const water = dark ? "#0c5058" : "#e9f5f4";
  const line = dark ? "#39828a" : "#b6dcd5";
  let object = "";
  if (id) object = `<g transform="translate(340 50) rotate(14 32 32)" fill="none" stroke="${dark ? '#a2d8d4' : '#7b9e9f'}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${itemDrawing(id)}</g><path d="M337 128q-18 9-24 26" fill="none" stroke="${line}" stroke-width="2" stroke-dasharray="4 7"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" role="img" aria-label="바다거북과 바다를 표현한 교육용 일러스트"><ellipse cx="257" cy="151" rx="211" ry="131" fill="${water}"/><path d="M30 230q70-30 130 0t130 0 150 0M63 250q90-20 160 0t205-5" fill="none" stroke="${line}" stroke-width="2"/><g fill="none" stroke="${line}" stroke-width="2"><circle cx="138" cy="69" r="9"/><circle cx="155" cy="43" r="4"/><circle cx="370" cy="173" r="6"/><path d="M62 193q-8-40-20-36m20 36q16-49 29-52M433 234q-12-44 0-62m0 42q26-35 30-58m-30 66q-29-17-28-40"/></g><g transform="translate(236 150) rotate(-18)"><path d="M-29-29Q-86-94-98-62q-5 18 53 51M-22 30q-41 71-63 40-7-14 47-55M45-22q36-49 52-25 4 13-40 38M42 21q48 34 41 51-10 17-43-39" fill="#76bda5" stroke="#2d7f72" stroke-width="3"/><path d="M-63-1l-28 5 29 8" fill="#76bda5" stroke="#2d7f72" stroke-width="3"/><ellipse rx="69" ry="47" fill="#39967f" stroke="#1e6a5d" stroke-width="3"/><path d="M-28-27L8-35l30 25-4 30-31 17-32-17zM-28-27l-18-10M8-35l6-11M38-10l28-5M34 20l20 15M3 37l-1 10M-29 20l-20 14M-28-27l-1 47" fill="none" stroke="#9bd0a6" stroke-width="3"/><ellipse cx="82" cy="0" rx="25" ry="22" fill="#94cfb2" stroke="#2d7f72" stroke-width="3"/><circle cx="90" cy="-7" r="3.5" fill="#164c48"/><path d="M96 7q-6 3-10 0" fill="none" stroke="#2d7f72" stroke-width="2"/></g>${object}<g fill="${dark ? '#8dcabd' : '#71b2a5'}"><path d="M103 116q-19-17-33-2l-13-8v23l13-8q14 13 33-5z"/><path d="M409 114q19-17 33-2l13-8v23l-13-8q-14 13-33-5z"/></g></svg>`;
}
$("#hero-art").innerHTML = oceanArt(null, true);
$("#empty-art").innerHTML = oceanArt();
$("#category-options").insertAdjacentHTML("beforeend", CASES.map(c => `<label class="category"><input type="radio" name="category" value="${c.id}">${itemIcon(c.id)}<span>${c.name}</span></label>`).join(""));

function selectCategory(id) {
  if (!CASES.some(c => c.id === id)) return;
  selectedId = id;
  document.querySelectorAll('input[name="category"]').forEach(r => { r.checked = r.value === id; });
  $("#show-result").disabled = false;
  $("#show-result").textContent = "피해 사례와 실천 방법 보기";
}
$("#category-options").addEventListener("change", e => selectCategory(e.target.value));
$("#show-result").addEventListener("click", () => showCase(selectedId));
$("#try-example").addEventListener("click", () => { selectCategory("straw"); showCase("straw"); });

function showCase(id, focus = true) {
  const c = CASES.find(c => c.id === id);
  if (!c) return;
  currentCase = c;
  $("#result-empty").hidden = true;
  $("#result-content").hidden = false;
  $("#result-kind").textContent = c.name;
  $("#case-label").textContent = c.label;
  $("#case-art").innerHTML = oceanArt(c.id);
  $("#animal-name").textContent = c.animal;
  $("#case-title").textContent = c.title;
  $("#case-description").textContent = c.description;
  $("#disposal").textContent = c.disposal;
  $("#alternative").textContent = c.alternative;
  $("#case-source").href = c.source;
  $("#case-source").textContent = c.sourceName + " · 근거 자료";
  updateSaveButton();
  if (focus) $("#case-title").focus({ preventScroll: true });
  if (focus && window.matchMedia("(max-width: 640px)").matches) $("#result-content").scrollIntoView({ behavior: "smooth", block: "start" });
}
function updateSaveButton() {
  const saved = currentCase && records.some(r => r.id === currentCase.id);
  $("#save-record").disabled = Boolean(saved);
  $("#save-record").textContent = saved ? (storageAvailable ? "도감에 기록했어요" : "이번 방문에 기록했어요") : "도감에 기록하기";
}

async function handlePhoto(file) {
  const request = ++photoRequest;
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { toast("JPG, PNG, WEBP, GIF 사진을 선택해 주세요. HEIC 사진은 JPG로 변환해 주세요."); return; }
  if (file.size > 8 * 1024 * 1024) { toast("사진은 8MB 이하로 선택해 주세요."); return; }
  const url = URL.createObjectURL(file);
  const probe = new Image();
  try { probe.src = url; await probe.decode(); }
  catch { URL.revokeObjectURL(url); if (request === photoRequest) toast("사진을 읽을 수 없어요. 다른 사진을 선택해 주세요."); return; }
  if (request !== photoRequest) { URL.revokeObjectURL(url); return; }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = url;
  $("#photo-preview").src = url;
  $("#photo-preview").hidden = false;
  $("#upload-placeholder").hidden = true;
  $("#remove-photo").hidden = false;
  $("#file-status").textContent = `${file.name} · 사진을 보고 아래에서 종류를 직접 선택해 주세요.`;
  selectedId = null;
  document.querySelectorAll('input[name="category"]').forEach(r => { r.checked = false; });
  $("#show-result").disabled = true;
  $("#show-result").textContent = "종류를 선택해 주세요";
  currentCase = null;
  $("#result-empty").hidden = false;
  $("#result-content").hidden = true;
}
["#file-input", "#camera-input"].forEach(selector => $(selector).addEventListener("change", e => { handlePhoto(e.target.files[0]); e.target.value = ""; }));
$("#remove-photo").addEventListener("click", () => {
  photoRequest++;
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = null;
  $("#photo-preview").removeAttribute("src");
  $("#photo-preview").hidden = true;
  $("#upload-placeholder").hidden = false;
  $("#remove-photo").hidden = true;
  $("#file-status").textContent = "사진은 서버로 전송되지 않습니다.";
});
const dropzone = $("#dropzone");
["dragenter", "dragover"].forEach(event => dropzone.addEventListener(event, e => { e.preventDefault(); dropzone.classList.add("dragover"); }));
["dragleave", "drop"].forEach(event => dropzone.addEventListener(event, e => { e.preventDefault(); dropzone.classList.remove("dragover"); }));
dropzone.addEventListener("drop", e => handlePhoto(e.dataTransfer.files[0]));
// 다른 영역에 놓은 파일 때문에 현재 페이지가 바뀌는 것을 막습니다.
window.addEventListener("dragover", e => e.preventDefault());
window.addEventListener("drop", e => e.preventDefault());

$("#save-record").addEventListener("click", () => {
  if (!currentCase || records.some(r => r.id === currentCase.id)) return;
  records.push({ id: currentCase.id, date: new Date().toISOString() });
  persistRecords();
  updateSaveButton();
  toast(storageAvailable ? "도감에 기록했어요. 나의 바다 도감에서 확인하세요." : "브라우저 저장이 제한되어 이번 방문에만 기록됩니다.");
});
function renderCollection() {
  $("#nav-count").textContent = records.length;
  $("#collection-count").textContent = `${records.length} / ${CASES.length}`;
  $("#collection-progress").value = records.length;
  $("#empty-collection").hidden = records.length > 0;
  $("#clear-records").hidden = !records.length;
  $("#storage-note").textContent = storageAvailable ? "기록은 이 브라우저에만 저장됩니다. 사진은 기록에 저장하지 않습니다." : "브라우저 저장이 제한되어 기록은 이번 방문에만 유지됩니다. 사진은 저장하지 않습니다.";
  const grid = $("#collection-grid");
  grid.replaceChildren();
  records.slice().reverse().forEach(r => {
    const c = CASES.find(c => c.id === r.id);
    const card = document.createElement("article");
    card.className = "panel collection-card";
    card.innerHTML = `<div class="mini-art">${oceanArt(c.id)}</div><span class="tag">${c.name}</span><h3>${c.title}</h3><p>${new Date(r.date).toLocaleDateString("ko-KR")} 기록</p><button class="text-button">이야기 다시 보기</button>`;
    card.querySelector("button").addEventListener("click", () => { location.hash = "explore"; selectCategory(c.id); showCase(c.id, false); setTimeout(() => $("#case-title").focus(), 0); });
    grid.append(card);
  });
}
$("#clear-records").addEventListener("click", () => $("#delete-dialog").showModal());
$("#cancel-delete").addEventListener("click", () => $("#delete-dialog").close());
$("#confirm-delete").addEventListener("click", () => { records = []; persistRecords(); updateSaveButton(); $("#delete-dialog").close(); toast("도감 기록을 삭제했어요."); });

function wrapText(ctx, text, x, y, width, lineHeight) {
  let line = "";
  for (const char of text) {
    if (ctx.measureText(line + char).width > width && line) { ctx.fillText(line, x, y); y += lineHeight; line = ""; }
    line += char;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}
async function makeCard(c) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3f9f8"; ctx.fillRect(0, 0, 1080, 1600);
  ctx.fillStyle = "#073b42"; ctx.fillRect(0, 0, 1080, 130);
  ctx.fillStyle = "#fff"; ctx.font = 'bold 36px "Malgun Gothic", sans-serif'; ctx.fillText("바다에 닿기 전에", 65, 83);
  const art = new Image();
  const url = URL.createObjectURL(new Blob([oceanArt(c.id)], { type: "image/svg+xml;charset=utf-8" }));
  try { art.src = url; await art.decode(); ctx.drawImage(art, 70, 145, 940, 480); }
  finally { URL.revokeObjectURL(url); }
  ctx.fillStyle = "#597078"; ctx.font = '24px "Malgun Gothic", sans-serif'; ctx.fillText("교육용 일러스트 · 실제 피해 사진 아님", 65, 650);
  ctx.fillStyle = "#087f79"; ctx.font = 'bold 28px "Malgun Gothic", sans-serif'; ctx.fillText(`${c.name} · ${c.animal}`, 65, 720);
  ctx.fillStyle = "#173d45"; ctx.font = 'bold 48px "Malgun Gothic", sans-serif';
  let y = wrapText(ctx, c.title, 65, 790, 950, 66) + 20;
  ctx.font = '30px "Malgun Gothic", sans-serif'; ctx.fillStyle = "#48636b";
  y = wrapText(ctx, c.description, 65, y, 950, 46) + 26;
  ctx.fillStyle = "#087f79"; ctx.font = 'bold 31px "Malgun Gothic", sans-serif'; ctx.fillText("오늘의 작은 실천", 65, y); y += 52;
  ctx.fillStyle = "#173d45"; ctx.font = '30px "Malgun Gothic", sans-serif';
  y = wrapText(ctx, c.alternative, 65, y, 950, 46);
  ctx.fillStyle = "#597078"; ctx.font = '23px "Malgun Gothic", sans-serif';
  wrapText(ctx, `근거: ${c.sourceName}`, 65, Math.max(y + 50, 1370), 950, 34);
  ctx.font = '22px "Malgun Gothic", sans-serif'; ctx.fillText("해양 환경 교육 체험판 · AI 미연동 · 작은 실천, 살아 있는 바다", 65, 1530);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("카드 생성 실패")), "image/png"));
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
let cardBusy = false;
async function exportCard(share) {
  if (!currentCase || cardBusy) return;
  const c = currentCase;
  cardBusy = true;
  $("#download-card").disabled = $("#share-card").disabled = true;
  try {
    const blob = await makeCard(c);
    const file = new File([blob], `바다에닿기전에-${c.name}.png`, { type: "image/png" });
    if (share && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: c.title, text: `${c.title}\n${c.alternative}\n근거: ${c.source}`, files: [file] });
    } else {
      download(blob, file.name);
      toast(share ? "이 환경은 직접 공유를 지원하지 않아 카드를 저장했어요. 저장된 이미지를 SNS에 올려주세요." : "카드 이미지를 저장했어요.");
    }
  } catch (error) { if (error.name !== "AbortError") toast("카드를 만들거나 공유하지 못했어요. 카드 저장 버튼으로 다시 시도해 주세요."); }
  finally { cardBusy = false; $("#download-card").disabled = $("#share-card").disabled = false; }
}
$("#download-card").addEventListener("click", () => exportCard(false));
$("#share-card").addEventListener("click", () => exportCard(true));

const QUESTIONS = [
  { question: "바다거북이 비닐봉지를 삼키는 이유는 무엇일까요?", options: ["비닐을 먹이로 착각할 수 있어서", "비닐이 소화를 도와서", "비닐이 바다거북의 먹이여서"], answer: 0, explanation: "바다거북은 비닐과 플라스틱 조각을 먹이로 착각해 삼킬 수 있어요." },
  { question: "생수·음료용 무색 투명 페트병은 어떻게 배출할까요?", options: ["음료가 남은 채로 버려요", "비우고 헹군 뒤 라벨을 떼어 별도 배출해요", "다른 쓰레기를 넣어서 버려요"], answer: 1, explanation: "내용물을 비우고 헹군 뒤 라벨을 제거해요. 최종 배출 방법은 지역 안내를 확인하세요." },
  { question: "해변에서 낚싯줄에 얽힌 동물을 발견했다면?", options: ["혼자 다가가 줄을 잡아당겨요", "먹이를 주며 집으로 데려가요", "거리를 두고 보호자나 관련 구조기관에 알려요"], answer: 2, explanation: "얽힌 동물에게 직접 접근하면 사람과 동물 모두 다칠 수 있어요. 안전한 거리를 두고 구조기관에 알려주세요." }
];
let quizIndex = 0, quizScore = 0, answered = false;
function renderQuiz() {
  answered = false;
  $("#quiz-feedback").textContent = "";
  $("#quiz-next").hidden = true;
  const area = $("#quiz-area"); area.replaceChildren();
  $("#quiz-progress").textContent = `${Math.min(quizIndex + 1, QUESTIONS.length)} / ${QUESTIONS.length}`;
  if (quizIndex >= QUESTIONS.length) {
    area.innerHTML = `<h3>오늘도 바다와 한 걸음 가까워졌어요!</h3><p class="quiz-score">${quizScore} / ${QUESTIONS.length}</p><p>이제 오늘 실천할 수 있는 행동 하나를 정해 볼까요?</p>`;
    $("#quiz-next").textContent = "다시 풀기"; $("#quiz-next").hidden = false; return;
  }
  const q = QUESTIONS[quizIndex];
  const heading = document.createElement("h3"); heading.textContent = q.question; area.append(heading);
  const options = document.createElement("div"); options.className = "quiz-options";
  q.options.forEach((text, index) => {
    const button = document.createElement("button"); button.className = "quiz-option"; button.textContent = text;
    button.addEventListener("click", () => {
      if (answered) return; answered = true;
      const correct = index === q.answer; if (correct) quizScore++;
      options.querySelectorAll("button").forEach((b, i) => { b.disabled = true; if (i === q.answer) b.classList.add("correct"); });
      if (!correct) button.classList.add("wrong");
      $("#quiz-feedback").textContent = (correct ? "정답이에요! " : `정답: ${q.options[q.answer]}. `) + q.explanation;
      $("#quiz-next").textContent = quizIndex === QUESTIONS.length - 1 ? "결과 보기" : "다음 문제";
      $("#quiz-next").hidden = false;
    }); options.append(button);
  }); area.append(options);
}
$("#quiz-next").addEventListener("click", () => { if (quizIndex >= QUESTIONS.length) { quizIndex = 0; quizScore = 0; } else { quizIndex++; } renderQuiz(); });
$("#print-guide").addEventListener("click", () => window.print());
function route() {
  const requested = location.hash.slice(1);
  const page = ["explore", "collection", "learn"].includes(requested) ? requested : "explore";
  document.querySelectorAll(".page").forEach(section => { section.hidden = section.id !== page; });
  document.querySelectorAll("[data-page]").forEach(link => { if (link.dataset.page === page) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); });
  if (requested !== "workspace") window.scrollTo({ top: 0 });
}
window.addEventListener("hashchange", route);
window.addEventListener("storage", e => { if (e.key === STORAGE_KEY || e.key === null) { records = readRecords(); renderCollection(); updateSaveButton(); } });
renderCollection(); renderQuiz(); route();
