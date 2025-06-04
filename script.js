const moodForm = document.getElementById('moodForm');
const dateInput = document.getElementById('date');
const moodInput = document.getElementById('mood');
const moodChartCanvas = document.getElementById('moodChart');

// Load from Local Storage
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};

moodForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const date = dateInput.value;
  const mood = moodInput.value;

  if (date && mood) {
    moodData[date] = mood;
    localStorage.setItem('moodData', JSON.stringify(moodData));
    updateChart();
    moodForm.reset();
  }
});

function countMoodsByDate(data) {
  const moodTypes = ['Happy', 'Sad', 'Angry'];
  const dates = Object.keys(data).sort();
  const moodCounts = moodTypes.map(mood => 
    dates.map(date => data[date] === mood ? 1 : 0)
  );

  return { dates, moodCounts, moodTypes };
}

function updateChart() {
  const { dates, moodCounts, moodTypes } = countMoodsByDate(moodData);

  if (window.moodChart) {
    window.moodChart.destroy();
  }

  window.moodChart = new Chart(moodChartCanvas, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: moodTypes.map((mood, index) => ({
        label: mood,
        data: moodCounts[index],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'][index]
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Mood Tracker Graph'
        }
      }
    }
  });
}

function exportToCSV() {
  const rows = [['Date', 'Mood']];
  for (const [date, mood] of Object.entries(moodData)) {
    rows.push([date, mood]);
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'mood_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Load chart when page loads
updateChart();
