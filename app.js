let chart; // Chart instance

function calculatePearson() {
  const xVals = document.getElementById('xInput').value.split(',').map(Number);
  const yVals = document.getElementById('yInput').value.split(',').map(Number);

  if (xVals.length !== yVals.length || xVals.length === 0 || xVals.includes(NaN) || yVals.includes(NaN)) {
    document.getElementById('result').innerText = '❌ Error: Same length & valid numbers required.';
    return;
  }

  const n = xVals.length;
  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const sumXY = xVals.reduce((sum, x, i) => sum + x * yVals[i], 0);
  const sumX2 = xVals.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = yVals.reduce((sum, y) => sum + y * y, 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(
    (n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2)
  );

  const r = numerator / denominator;

  // Step-by-step breakdown in Math-style HTML
  const breakdown = `
    <div style="line-height:1.6;">
      <strong>Pearson Correlation Formula:</strong><br>
      r = [n(∑xy) - (∑x)(∑y)] / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]<br><br>

      <strong>Given:</strong><br>
      n = ${n}<br>
      ∑x = ${sumX}, ∑y = ${sumY}<br>
      ∑xy = ${sumXY}, ∑x² = ${sumX2}, ∑y² = ${sumY2}<br><br>

      <strong>Substitute:</strong><br>
      r = [${n}(${sumXY}) - (${sumX})(${sumY})] / √[(${n}×${sumX2} - ${sumX}²)(${n}×${sumY2} - ${sumY}²)]<br>
      r = [${n * sumXY} - ${sumX * sumY}] / √[${n * sumX2 - sumX ** 2} × ${n * sumY2 - sumY ** 2}]<br>
      r = ${numerator} / √[${(n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2)}]<br>
      <p id="finalResult">r = ${r.toFixed(4)}</p>
    </div>
  `;

  document.getElementById('result').innerHTML = breakdown;

  drawChart(xVals, yVals);
}


// Function to draw the chart with trend line

function drawChart(xData, yData) {
  if (chart) chart.destroy();

  // Calculate the slope and intercept for the trend line
  // Pearson correlation does not directly give us a line, but we can calculate a linear regression line
  const n = xData.length;
  const sumX = xData.reduce((a, b) => a + b, 0);
  const sumY = yData.reduce((a, b) => a + b, 0);
  const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
  const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate line data for chart (2 points for line: min and max of x)
  const minX = Math.min(...xData);
  const maxX = Math.max(...xData);
  const lineData = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ];

  const ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Data Points',
          data: xData.map((x, i) => ({ x, y: yData[i] })),
          backgroundColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Trend Line',
          type: 'line',
          data: lineData,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // hide points on the line
        }
      ]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: 'X Values' }
        },
        y: {
          title: { display: true, text: 'Y Values' }
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      }
    }
  });
}


// Function to export data to CSV

function exportToCSV() {
  const xVals = document.getElementById('xInput').value.split(',').map(Number);
  const yVals = document.getElementById('yInput').value.split(',').map(Number);
  if (xVals.length !== yVals.length || xVals.includes(NaN) || yVals.includes(NaN)) {
    alert("Invalid input data.");
    return;
  }

  let csv = "X,Y\n";
  for (let i = 0; i < xVals.length; i++) {
    csv += `${xVals[i]},${yVals[i]}\n`;
  }


  // Create a Blob and download it
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "pearson_data.csv");
  a.click();
}

// Function to download the chart as an image

function downloadChart() {
    const xInput = document.getElementById('xInput').value.trim();
  const yInput = document.getElementById('yInput').value.trim();
  const result = document.getElementById('result').innerText;


  // Check if both inputs are filled and result contains Pearson r
  if (!xInput || !yInput) {
    alert("❌ Please enter both X and Y values before downloading the chart.");
    return;
  }

  if (!result.includes("Pearson r")) {
    alert("❌ Please calculate Pearson correlation first.");
    return;
  }
  const canvas = document.getElementById('myChart');
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pearson_chart.png';
  a.click();
}
