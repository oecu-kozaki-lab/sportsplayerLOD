let chartInstance = null;

// グラフをリセット
function clearChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

// ===== 競技別 人数集計 =====
function drawSportChart() {
  clearChart();

  const countMap = {};

  mergedData.forEach(p => {
    const sports = Array.isArray(p.occupationLabel)
      ? p.occupationLabel
      : [p.occupationLabel];

    sports.forEach(s => {
      if (!s) return;
      countMap[s] = (countMap[s] || 0) + 1;
    });
  });

  chartInstance = new Chart(
    document.getElementById("statsChart"),
    {
      type: "pie",
      data: {
        labels: Object.keys(countMap),
        datasets: [{
          data: Object.values(countMap),
          radius: "80%"
        }]
      },
      options: {
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        },
        plugins: {
          title: {
            display: true,
            text: "競技別 選手人数"
          },
          legend: {
            position: "bottom",
            labels: {
                padding: 6,
                boxWidth: 12,
                font: {
                    size: 12
                }
            }
          }
        }
      }
    }
  );
}

// ===== 性別 人数集計 =====
function drawGenderChart() {
  clearChart();

  const countMap = {
    男性: 0,
    女性: 0,
    不明: 0
  };

  mergedData.forEach(p => {
    if (p.genderLabel === "男性") countMap["男性"]++;
    else if (p.genderLabel === "女性") countMap["女性"]++;
    else countMap["不明"]++;
  });

  chartInstance = new Chart(
    document.getElementById("statsChart"),
    {
      type: "pie",
      data: {
        labels: Object.keys(countMap),
        datasets: [{
          data: Object.values(countMap)
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "性別別 選手人数"
          },
          legend: {
            position: "bottom",
            labels: {
                padding: 10
            }
          }
        }
      }
    }
  );
}

// 初期表示：競技別
drawSportChart();
