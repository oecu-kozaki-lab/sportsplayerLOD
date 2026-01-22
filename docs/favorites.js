function showFavoritePage() {
  const favorites = getFavorites();

  const count = document.getElementById("resultCount");
  const result = document.getElementById("result");

  if (favorites.length === 0) {
    count.textContent = "";
    result.innerHTML = "<p>お気に入りに登録された選手はまだいません。</p>";
    return;
  }

  const favPlayers = mergedData.filter(p =>
    favorites.includes(p.person)
  );

  displayResult(favPlayers);
    count.textContent = `お気に入り：${favPlayers.length} 件`;

}

showFavoritePage();
