// 1年生の漢字（80）を入れてね：写真の表と同じ順にしたいなら、この配列をその順に並べればOK
// いまはサンプルとして一部→残りは埋め草（あとで置換しやすい）
const KANJI_LIST = [
  "一","右","雨","円","王","音","下","火","花","貝",
  "学","気","九","休","玉","金","空","月","犬","見",
  "五","口","校","左","三","山","子","四","糸","字",
  "耳","七","車","手","十","出","女","小","上","森",
  "人","水","正","生","青","夕","石","赤","千","川",
  "先","早","草","足","村","大","男","竹","中","虫",
  "町","天","田","土","二","日","入","年","白","八",
  "百","文","木","本","名","目","立","力","林","六",
  "外","右","左","休","犬","王","出","上","下","小" // ←ここは仮。あとで本物に置換してOK
].slice(0,80);

const GRADE_2 = [
"引","羽","雲","園","遠","何","科","夏","家","歌","画","回","会","海","絵","外",
"角","楽","活","間","丸","岩","顔","汽","記","帰","弓","牛","魚","京","強","教",
"近","兄","形","計","元","言","原","戸","古","午","後","語","工","公","広","交",
"光","考","行","高","黄","合","谷","国","黒","今","才","細","作","算","止","市",
"矢","姉","思","紙","寺","自","時","室","社","弱","首","秋","週","春","書","少",
"場","色","食","心","新","親","図","数","西","声","星","晴","切","雪","船","線",
"前","組","走","多","太","体","台","地","池","知","茶","昼","長","鳥","朝","直",
"通","弟","店","点","電","刀","冬","当","東","答","頭","同","道","読","内","南",
"肉","馬","売","買","麦","半","番","父","風","分","聞","米","歩","母","方","北",
"毎","妹","万","明","鳴","毛","門","夜","野","友","用","曜","来","里","理","話"
];

let currentGrade = "1";

function getCurrentKanjiList(){
  return currentGrade === "1" ? GRADE_1 : GRADE_2;
}
// ===== 子どもアカウント管理 =====
const KIDS_KEY = "kanji_kids_v1";
const ACTIVE_KID_KEY = "kanji_active_kid_v1";

const kidSelect = document.getElementById("kidSelect");
const addKidBtn = document.getElementById("addKidBtn");
const renameKidBtn = document.getElementById("renameKidBtn");
const deleteKidBtn = document.getElementById("deleteKidBtn");

function loadKids(){
  try{
    const arr = JSON.parse(localStorage.getItem(KIDS_KEY) || "[]");
    return Array.isArray(arr) && arr.length ? arr : ["たろう"];
  }catch{
    return ["たろう"];
  }
}
function saveKids(kids){
  localStorage.setItem(KIDS_KEY, JSON.stringify(kids));
}

let kids = loadKids();
let activeKid = localStorage.getItem(ACTIVE_KID_KEY) || kids[0];

function storageKeyForKid(name){
  return `kanji_sheet_state_v1__${encodeURIComponent(name)}`;
}

function loadStateForKid(name){
  try{
    return JSON.parse(localStorage.getItem(storageKeyForKid(name)) || "{}");
  }catch{
    return {};
  }
}
function saveStateForKid(name, state){
  localStorage.setItem(storageKeyForKid(name), JSON.stringify(state));
}

function refreshKidSelect(){
  // activeKidがリストにない時の保険
  if(!kids.includes(activeKid)) activeKid = kids[0];

  kidSelect.innerHTML = "";
  for(const k of kids){
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    if(k === activeKid) opt.selected = true;
    kidSelect.appendChild(opt);
  }
  localStorage.setItem(ACTIVE_KID_KEY, activeKid);
}

function switchKid(name){
  activeKid = name;
  localStorage.setItem(ACTIVE_KID_KEY, activeKid);
  state = loadStateForKid(activeKid);
  render();
}

kidSelect?.addEventListener("change", (e) => {
  switchKid(e.target.value);
});

addKidBtn?.addEventListener("click", () => {
  const name = prompt("追加する子どもの名前（例：はなこ）");
  if(!name) return;
  const trimmed = name.trim();
  if(!trimmed) return;
  if(kids.includes(trimmed)){
    alert("その名前はすでにあります");
    return;
  }
  kids.push(trimmed);
  saveKids(kids);
  switchKid(trimmed);
  refreshKidSelect();
});

renameKidBtn?.addEventListener("click", () => {
  const from = activeKid;
  const name = prompt("新しい名前", from);
  if(!name) return;
  const to = name.trim();
  if(!to) return;
  if(to === from) return;
  if(kids.includes(to)){
    alert("その名前はすでにあります");
    return;
  }

  // データ移行
  const oldKey = storageKeyForKid(from);
  const newKey = storageKeyForKid(to);
  const data = localStorage.getItem(oldKey);
  if(data != null) localStorage.setItem(newKey, data);
  localStorage.removeItem(oldKey);

  // kidsリスト更新
  kids = kids.map(k => (k === from ? to : k));
  saveKids(kids);

  activeKid = to;
  localStorage.setItem(ACTIVE_KID_KEY, activeKid);
  refreshKidSelect();
  state = loadStateForKid(activeKid);
  render();
});

deleteKidBtn?.addEventListener("click", () => {
  if(kids.length <= 1){
    alert("最後の1人は削除できません");
    return;
  }
  if(!confirm(`${activeKid} の記録を削除しますか？`)) return;

  // データ削除
  localStorage.removeItem(storageKeyForKid(activeKid));

  // kidsから削除→別の子に切替
  kids = kids.filter(k => k !== activeKid);
  saveKids(kids);

  activeKid = kids[0];
  localStorage.setItem(ACTIVE_KID_KEY, activeKid);
  refreshKidSelect();
  state = loadStateForKid(activeKid);
  render();
});

// 初期UI反映
refreshKidSelect();
// ===== 子どもアカウント管理ここまで =====

const gridEl = document.getElementById("grid");
const learnedCountEl = document.getElementById("learnedCount");
const totalCountEl = document.getElementById("totalCount");
const resetBtn = document.getElementById("resetBtn");
const xModeEl = document.getElementById("xMode");

const paletteButtons = document.querySelectorAll(".colorBtn");

totalCountEl.textContent = String(KANJI_LIST.length);

let selectedColor = "yellow";

// state: { [kanji]: { fill: "yellow"|"pink"|...|"" , x: 0|1 } }
function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  }catch{
    return {};
  }
}
function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadStateForKid(activeKid);

function setSelectedColor(color){
  selectedColor = color;
  paletteButtons.forEach(b => b.classList.toggle("selected", b.dataset.color === color));
}

paletteButtons.forEach(btn => {
  btn.addEventListener("click", () => setSelectedColor(btn.dataset.color));
});

function render(){
  gridEl.innerHTML = "";

  for(const kanji of KANJI_LIST){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = kanji;

    const st = state[kanji] || { fill: "", x: 0 };
    if(st.fill) cell.dataset.fill = st.fill;
    if(st.x) cell.dataset.x = "1";

    const xmark = document.createElement("div");
    xmark.className = "xmark";
    xmark.textContent = "×";
    cell.appendChild(xmark);

    cell.addEventListener("click", () => {
      const cur = state[kanji] || { fill: "", x: 0 };

      if(xModeEl.checked){
        // ×モード：×のON/OFF
        cur.x = cur.x ? 0 : 1;
      }else{
        // 色モード：同じ色なら消す、違う色なら塗り替え
        cur.fill = (cur.fill === selectedColor) ? "" : selectedColor;
        // 色を付けたら×は消す（プリント運用っぽく）
        if(cur.fill) cur.x = 0;
      }

      state[kanji] = cur;
      saveStateForKid(activeKid, state);
      // 表示更新（軽量）
      if(cur.fill) cell.dataset.fill = cur.fill; else cell.removeAttribute("data-fill");
      if(cur.x) cell.dataset.x = "1"; else cell.removeAttribute("data-x");
      updateCounts();
    });

    gridEl.appendChild(cell);
  }

  updateCounts();
}

function updateCounts(){
  // 「覚えた」は “色が付いているマス” をカウント（×はカウントしない）
  let learned = 0;
  for(const k of KANJI_LIST){
    const st = state[k];
    if(st && st.fill) learned++;
  }
  learnedCountEl.textContent = String(learned);
}

resetBtn.addEventListener("click", () => {
  if(!confirm("全部リセットしますか？（色と×が消えます）")) return;
  state = {};
  saveState(state);
  render();
});

// 初期色
setSelectedColor("yellow");
render();