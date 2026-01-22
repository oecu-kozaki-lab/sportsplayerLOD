let currentList = [];
let currentIndex = -1;

// ★ ページネーション用
let currentPage = 1;
const PAGE_SIZE = 100;
let currentAllResults = [];

// --- 同一人物を統合 ---
function mergeSamePerson(data) {
  const map = {};

  data.forEach(p => {
    const id = p.person;

    if (!map[id]) {
      map[id] = { ...p };
    } else {

      // 🔹 競技チーム統合
      if (p.occupationLabel) {
        map[id].occupationLabel = toArray(map[id].occupationLabel);
        if (!map[id].occupationLabel.includes(p.occupationLabel)) {
          map[id].occupationLabel.push(p.occupationLabel);
        }
      }

      // 🔹 出身地統合
      if (p.birthPlaceLabel) {
        map[id].birthPlaceLabel = toArray(map[id].birthPlaceLabel);
        if (!map[id].birthPlaceLabel.includes(p.birthPlaceLabel)) {
          map[id].birthPlaceLabel.push(p.birthPlaceLabel);
        }
      }

      //出身校統合
      if (p.schoolLabel) {
        map[id].schoolLabel = toArray(map[id].schoolLabel);
        if (!map[id].schoolLabel.includes(p.schoolLabel)) {
          map[id].schoolLabel.push(p.schoolLabel);
        }
      }

      // 🔹 所属チーム統合
      if (p.teamLabel) {
        map[id].teamLabel = toArray(map[id].teamLabel);
        if (!map[id].teamLabel.includes(p.teamLabel)) {
          map[id].teamLabel.push(p.teamLabel);
        }
      }

      // 🔹 ポジション統合
      if (p.positionLabel) {
        map[id].positionLabel = toArray(map[id].positionLabel);
        if (!map[id].positionLabel.includes(p.positionLabel)) {
          map[id].positionLabel.push(p.positionLabel);
        }
      }

      //受賞統合
      if (p.awardLabel) {
        map[id].awardLabel = toArray(map[id].awardLabel);
        if (!map[id].awardLabel.includes(p.awardLabel)) {
          map[id].awardLabel.push(p.awardLabel);
        }
      }
    }
  });

  return Object.values(map);
}

// --- 単体 → 配列変換 ---
function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// --- 表示用フォーマット（配列対応） ---
function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(" / ");
  }
  return value ?? "不明";
}

// 🔹 統合済みデータを作成（最重要）
const mergedData = mergeSamePerson(data);

// --- 検索処理 ---
function searchPlayer() {
  const keyword = document.getElementById("searchInput").value.trim();
  const sport = document.getElementById("sportFilter").value;
  const gender = document.getElementById("genderFilter").value;
  const sortType = document.getElementById("sortSelect").value;
  
  const guide = document.getElementById("guideMessage");

  if (!keyword && !sport && !gender) {
  const featured = getFeaturedPlayers();

  guide.innerHTML = `
    🔍 検索条件が未指定のため、様々な選手を表示しています。<br>
    または <a href="genre.html" style="color:#0066cc; text-decoration:underline;">
    競技ジャンルから探す
    </a> こともできます。
  `;

  document.getElementById("resultCount").textContent =
    `注目の選手：${featured.length} 件`;

  displayResult(featured);
  return;
}
  guide.textContent = "";


  sessionStorage.setItem("lastSearch",JSON.stringify({
    keyword,sport,gender,sortType
  }));

  saveHistory(keyword, sport, gender);

  const results = mergedData.filter(p =>
    (!keyword || p.personLabel.includes(keyword)) &&
    (!sport || formatValue(p.occupationLabel).includes(sport)) &&
    (!gender || p.genderLabel === gender)
  );

  // ===== 並び替え処理 =====
  if (sortType === "nameAsc") {
    results.sort((a, b) =>
      a.personLabel.localeCompare(b.personLabel, "ja")
    );
  }

  if (sortType === "nameDesc") {
    results.sort((a, b) =>
      b.personLabel.localeCompare(a.personLabel, "ja")
    );
  }

  if (sortType === "birthAsc") {
    results.sort((a, b) =>
      (a.birthDate ?? "9999").localeCompare(b.birthDate ?? "9999")
    );
  }

  if (sortType === "birthDesc") {
    results.sort((a, b) =>
      (b.birthDate ?? "0000").localeCompare(a.birthDate ?? "0000")
    );
  }

  if (sortType === "heightAsc") {
    results.sort((a, b) =>
      (a.heightLabel ?? 9999) - (b.heightLabel ?? 9999)
    );
  }

  if (sortType === "heightDesc") {
    results.sort((a, b) =>
      (b.heightLabel ?? 0) - (a.heightLabel ?? 0)
    );
  }

  if (sortType === "weightAsc") {
    results.sort((a, b) =>
      (a.weightLabel ?? 9999) - (b.weightLabel ?? 9999)
    );
  }

  if (sortType === "weightDesc") {
    results.sort((a, b) =>
      (b.weightLabel ?? 0) - (a.weightLabel ?? 0)
    );
  }

  currentAllResults = results;
  currentPage = 1;
  displayResult(currentAllResults);

}

// --- 表示処理 ---
function displayResult(players) {
  const resultDiv = document.getElementById("result");
  const countDiv = document.getElementById("resultCount");
  resultDiv.innerHTML = "";

  const total = players.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  // ★ 今ページに表示する分だけ切り出す
  currentList = players.slice(start, end);

  countDiv.textContent =
    `検索結果：${total} 件（${start + 1}〜${Math.min(end, total)}件）`;

  if (currentList.length === 0) {
    resultDiv.innerHTML = "<p>該当する選手が見つかりませんでした。</p>";
    return;
  }

  currentList.forEach((p,index) => {
    const fav = isFavorite(p.person);

    resultDiv.innerHTML += `
      <div class="card" onclick="openModalByIndex(${index})">
        <button class="favorite-btn ${fav ? "active" : ""}"
          onclick="event.stopPropagation(); toggleFavorite('${p.person}')">
          ${fav ? "★" : "☆"}
        </button>

        <img src="${p.image || 'noimage.jpg'}" alt="${p.personLabel}" loading="lazy">
        <h3>${p.personLabel}</h3>
        <p>競技：${formatValue(p.occupationLabel)}</p>
        <p>性別：${p.genderLabel ?? "不明"}</p>
        <p>生年月日：${p.birthDate ? p.birthDate.slice(0,10) : "不明"}</p>
        <p>出身地：${formatValue(p.birthPlaceLabel)}</p>
        <p>出身校：${formatValue(p.schoolLabel)}</p>
        <p>身長：${p.heightLabel ? p.heightLabel + " cm" : "不明"}</p>
        <p>体重：${p.weightLabel ? p.weightLabel + " kg" : "不明"}</p>
        <p>所属チーム：${formatValue(p.teamLabel)}</p>
        <p>ポジション：${formatValue(p.positionLabel)}</p>
        <p>受賞：${p.awardLabel ? formatValue(p.awardLabel) : "ーー"}</p>
      </div>
    `;
  });

  renderPager(total);
}

function renderPager(total) {
  let pager = document.getElementById("pager");

  if (!pager) {
    pager = document.createElement("div");
    pager.id = "pager";
    pager.style.textAlign = "center";
    pager.style.margin = "20px";
    document.body.appendChild(pager);
  }

  const maxPage = Math.ceil(total / PAGE_SIZE);
  pager.innerHTML = "";

  if (maxPage <= 1) return;

  if (currentPage > 1) {
    pager.innerHTML += `<button onclick="changePage(${currentPage - 1})">← 前へ</button>`;
  }

  pager.innerHTML += ` <strong>${currentPage} / ${maxPage}</strong> `;

  if (currentPage < maxPage) {
    pager.innerHTML += `<button onclick="changePage(${currentPage + 1})">次へ →</button>`;
  }
}

function changePage(page) {
  currentPage = page;
  displayResult(currentAllResults);
  window.scrollTo({ top: 0, behavior: "smooth" });
}


function openModalByIndex(index) {
  currentIndex = index;
  openModal(currentList[index].person);
}

// ===== トップへ戻るボタン制御 =====
const backToTop = document.getElementById("backToTop");

// スクロール量で表示・非表示
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});

// クリックでトップへスムーズスクロール
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

function saveHistory(keyword,sport,gender) {
  if (!keyword&&!sport&&!gender) return;

  const history=JSON.parse(localStorage.getItem("searchHistory"))||[];
  const item={keyword,sport,gender};

  const filtered=history.filter(h=>
    h.keyword !== keyword || h.sport !== sport || h.gender !== gender);
    
    filtered.unshift(item);

    //最大5件
    localStorage.setItem(
      "searchHistory",JSON.stringify(filtered.slice(0,5)));

      renderHistory();
}

function renderHistory() {
  const list=document.getElementById("historyList");
  if (!list) return;

  const history=JSON.parse(localStorage.getItem("searchHistory")) || [];
  list.innerHTML="";

  history.forEach(h => {
    const li=document.createElement("li");
    li.textContent=`${h.keyword || "（名前なし）"} / ${h.sport || "全競技"} / ${h.gender || "全性別"}`;
    
    li.onclick = () => {
      document.getElementById("searchInput").value=h.keyword;
      document.getElementById("sportFilter").value=h.sport;
      document.getElementById("genderFilter").value=h.gender;
      searchPlayer();
    };

    list.appendChild(li);
  });
}
renderHistory();

document.getElementById("resetHome").addEventListener("click", () => {
  sessionStorage.removeItem("lastSearch");
  // 入力欄を初期化
  document.getElementById("searchInput").value = "";
  document.getElementById("sportFilter").value = "";
  document.getElementById("genderFilter").value = "";
  document.getElementById("sortSelect").value = "";

  // 検索結果をクリア
  document.getElementById("result").innerHTML = "";
  document.getElementById("resultCount").textContent = "";
  
  // ガイド文があれば消す
  const guide = document.getElementById("guideMessage");
  if (guide) guide.textContent = "";

    // ★ ページネーションを消す
  const pager = document.getElementById("pager");
  if (pager) pager.remove();

});

window.addEventListener("DOMContentLoaded",() => {
  const saved = sessionStorage.getItem("lastSearch");
  if(!saved) return;

  const { keyword,sport,gender,sortType } = JSON.parse(saved);

  document.getElementById("searchInput").value=keyword || "";
  document.getElementById("sportFilter").value=sport || "";
  document.getElementById("genderFilter").value=gender || "";
  document.getElementById("sortSelect").value=sortType || "";

  searchPlayer();
});

function getFavorites() {
  return JSON.parse(localStorage.getItem("favoritePlayers")) || [];
}

function isFavorite(personId) {
  return getFavorites().includes(personId);
}

function toggleFavorite(personId) {
  let favorites=getFavorites();

  if (favorites.includes(personId)) {
    favorites=favorites.filter(id=>id !== personId);
  } else {
    favorites.push(personId);
  }

  localStorage.setItem("favoritePlayers",JSON.stringify(favorites));

  //ページ判定
  if (document.getElementById("searchInput")) {
    searchPlayer();
  } else {
    showFavoritePage();
  }
}

function toggleFavoriteFromModal(personId) {
  toggleFavorite(personId);   // ★切り替え
  openModal(personId);        // モーダル内容を再描画
}


// ----- ワンクリック条件リセット -----
function resetSearch() {
  //入力・選択を初期化
  document.getElementById("searchInput").value="";
  document.getElementById("sportFilter").value="";
  document.getElementById("genderFilter").value="";
  document.getElementById("sortSelect").value="";
}

// ===== 関連選手を取得 =====
function getRelatedPlayers(player, limit = 5) {
  return mergedData
    .filter(p =>
      p.person !== player.person &&
      formatValue(p.occupationLabel) === formatValue(player.occupationLabel)
    )
    .slice(0, limit);
}


// ===== モーダル表示 =====
function openModal(personId) {
  const player = mergedData.find(p => p.person === personId);
  if (!player) return;

  const fav = isFavorite(player.person);
  const modalBody = document.getElementById("modalBody");
  const wikiUrl="https://ja.wikipedia.org/wiki/特別:検索?search="+encodeURIComponent(player.personLabel);
  const wikidataUrl="https://kgs.hozo.jp/sample/details.html?key=wd:" + player.person;
  const relatedPlayers = getRelatedPlayers(player);

  modalBody.innerHTML = `
    <button class="modal-nav prev ${currentIndex <= 0 ? "disabled" : ""}"
     onclick="showPrevPlayer()" aria-label="前の選手"></button>

    <button class="modal-nav next ${currentIndex >= currentList.length - 1 ? "disabled" : ""}"
    onclick="showNextPlayer()" aria-label="次の選手"></button>

    <button class="modal-favorite-btn ${fav ? "active" : ""}"
        onclick="toggleFavoriteFromModal('${player.person}')">
        ${fav ? "★" : "☆"}
      </button>

    ${player.image ? `<img src="${player.image}" alt="${player.personLabel}">` : ""}
    <h2>${player.personLabel}</h2>
    <p><strong>競技：</strong>${formatValue(player.occupationLabel)}</p>
    <p><strong>性別：</strong>${player.genderLabel ?? "不明"}</p>
    <p><strong>生年月日：</strong>${player.birthDate ? player.birthDate.slice(0,10) : "不明"}</p>
    <p><strong>出身地：</strong>${formatValue(player.birthPlaceLabel)}</p>
    <p><strong>出身校：</strong>${formatValue(player.schoolLabel)}</p>
    <p><strong>身長：</strong>${player.heightLabel ? player.heightLabel + " cm" : "不明"}</p>
    <p><strong>体重：</strong>${player.weightLabel ? player.weightLabel + " kg" : "不明"}</p>
    <p><strong>所属チーム：</strong>${formatValue(player.teamLabel)}</p>
    <p><strong>ポジション：</strong>${formatValue(player.positionLabel)}</p>
    <p><strong>受賞：</strong>${player.awardLabel ? formatValue(player.awardLabel) : "ーー"}</p>
    <p style="margin-top:16px; text-align:center; display:flex; gap:30px; justify-content:center; flex-wrap:wrap;">
      <a href="${wikidataUrl}" target="_blank" rel="noopener"
        style="color:#16a34a; font-weight:600;">
        📚 Wikidataで詳しく見る
      </a><a href="${wikiUrl}" target="_blank" rel="noopener"
        style="color:#3b82f6; font-weight:600;">
        　📚 Wikipediaで詳しく見る
      </a>
    </p>
        ${relatedPlayers.length > 0 ? `
      <div style="margin-top:24px;">
        <h3 style="font-size:14px; text-align:center; margin-bottom:10px;">
          🔗 同じ競技の選手
        </h3>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${relatedPlayers.map(r => `
            <button
              style="
                padding:6px 12px;
                border-radius:999px;
                border:1px solid #ccc;
                background:#f8fafc;
                cursor:pointer;
                font-size:12px;
              "
              onclick="openModal('${r.person}')">
              ${r.personLabel}
            </button>
          `).join("")}
        </div>
      </div>
    ` : ""}
  `;

  document.getElementById("playerModal").style.display = "block";
}

// ===== モーダル閉じる =====
function closeModal() {
  document.getElementById("playerModal").style.display = "none";
}

// 背景クリックで閉じる
document.getElementById("playerModal").addEventListener("click", e => {
  if (e.target.id === "playerModal") {
    closeModal();
  }
});

function showPrevPlayer() {
  if (currentIndex > 0) {
    currentIndex--;
    openModal(currentList[currentIndex].person);
  }
}

function showNextPlayer() {
  if (currentIndex < currentList.length - 1) {
    currentIndex++;
    openModal(currentList[currentIndex].person);
  }
}

// ★ 注目選手を取得（例：先頭から8件）
function getFeaturedPlayers() {
  return mergedData.slice(0, 8);
}

function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;

  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = "<li class='history-empty'>履歴はありません</li>";
    return;
  }

  history.forEach((h, index) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const text = document.createElement("span");
    text.className = "history-text";
    text.textContent =
      `${h.keyword || "（名前なし）"} / ${h.sport || "全競技"} / ${h.gender || "全性別"}`;

    text.onclick = () => {
      document.getElementById("searchInput").value = h.keyword;
      document.getElementById("sportFilter").value = h.sport;
      document.getElementById("genderFilter").value = h.gender;
      searchPlayer();
    };

    const del = document.createElement("button");
    del.className = "history-delete";
    del.textContent = "🗑";
    del.onclick = (e) => {
      e.stopPropagation();
      if (!confirm("この検索履歴を削除しますか？")) return;

      history.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(history));
      renderHistory();
    };

    li.appendChild(text);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function clearSearchHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // ★ 履歴が空の場合
  if (history.length === 0) {
    alert("削除する検索履歴はありません。");
    return;
  }

  // ★ 履歴がある場合のみ確認
  if (!confirm("検索履歴をすべて削除しますか？")) return;

  localStorage.removeItem("searchHistory");
  renderHistory();
}

