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

const STORAGE_KEY = "kanji_sheet_state_v1";

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

let state = loadState();

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
      saveState(state);
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