// 年齢計算
function calcAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function showRanking() {
  const type = document.getElementById("rankingSelect").value;
  let list = [...mergedData];

  if (type.startsWith("height")) {
    list = list.filter(p => p.heightLabel);
    list.sort((a, b) =>
      type === "heightDesc"
        ? b.heightLabel - a.heightLabel
        : a.heightLabel - b.heightLabel
    );
  }

  if (type.startsWith("weight")) {
    list = list.filter(p => p.weightLabel);
    list.sort((a, b) =>
      type === "weightDesc"
        ? b.weightLabel - a.weightLabel
        : a.weightLabel - b.weightLabel
    );
  }

  if (type.startsWith("age")) {
    list = list
      .filter(p => p.birthDate)
      .map(p => ({ ...p, age: calcAge(p.birthDate) }))
      .filter(p => p.age !== null)
      .sort((a, b) =>
        type === "ageDesc" ? b.age - a.age : a.age - b.age
      );
  }

  const top10 = list.slice(0, 10);

  document.getElementById("resultCount").textContent =
    `ランキング結果：${top10.length} 件`;

  displayResult(top10);
}

// 初期表示
showRanking();
