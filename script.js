const moodForm = document.getElementById('moodForm');
const dateInput = document.getElementById('date');
const moodInput = document.getElementById('mood');
const suggestionBox = document.getElementById('suggestionBox');
const moodChartCanvas = document.getElementById('moodChart');

// Load from Local Storage
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};

function showSuggestion(mood) {
  const suggestions = {
    Happy: "Keep spreading your happiness! 😄",
    Sad: "Try taking a walk or listening to your favorite music. 🌈",
    Angry: "Deep breaths. Maybe write down what upset you. 🧘"
  };
  suggestionBox.textContent = suggestions[mood] || "Log your mood to get a tip.";
  suggestionBox.classList.add("visible");
}

moodForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const date = dateInput.value;
  const mood = moodInput.value;

  if (date && mood) {
    moodData[date] = mood;
    localStorage.setItem('moodData', JSON.stringify(moodData));
    showSuggestion(mood);
    updateChart();
    moodForm.reset();
  }
});

function countMoods(data) {
  const moodTypes = ['Happy', 'Sad', 'Angry'];
  const dates = Object.keys(data).sort();
  const counts = moodTypes.map(mood =>
    dates.map(date => data[date] === mood ? 1 : 0)
  );

  return { dates, counts, moodTypes };
}

function updateChart() {
  const { dates, counts, moodTypes } = countMoods(moodData);

  if (window.moodChart) {
    window.moodChart.destroy();
  }

  window.moodChart = new Chart(moodChartCanvas, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: moodTypes.map((mood, index) => ({
        label: mood,
        data: counts[index],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'][index]
      }))
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000
      },
      plugins: {
        title: {
          display: true,
          text: 'Mood Trends Over Time'
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

// Load chart on page load
updateChart();
