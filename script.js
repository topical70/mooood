// Replace this with your Google Apps Script Web App URL from Step 2 of Google Sheets setup
const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE';

const form = document.getElementById('moodForm');
const suggestionBox = document.getElementById('suggestionBox');
const exportBtn = document.getElementById('exportBtn');
const moodChartCanvas = document.getElementById('moodChart');

const suggestions = {
  Happy: "Keep spreading your happiness! 😄",
  Sad: "Try taking a walk or listening to your favorite music. 🌈",
  Angry: "Deep breaths. Maybe write down what upset you. 🧘",
  Excited: "Great energy! Channel it into a creative project! 🎨",
  Anxious: "Take a few deep breaths and try some mindfulness. 🧘‍♂️",
  Calm: "Enjoy your peaceful moment. Maybe meditate or read. 📚",
  Tired: "Make sure to rest well and recharge! 💤"
};

const moodTypes = ['Happy', 'Sad', 'Angry', 'Excited', 'Anxious', 'Calm', 'Tired'];
const moodColors = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#00bcd4', '#795548'];

let moodData = JSON.parse(localStorage.getItem('moodData')) || [];

function saveMood(date, mood) {
  moodData.push({ date, mood });
  localStorage.setItem('moodData', JSON.stringify(moodData));
}

function sendMoodToGoogleSheets(date, mood) {
  fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date,
      mood,
      userAgent: navigator.userAgent
    })
  })
  .then(res => res.text())
  .then(data => console.log('Data sent to Google Sheets:', data))
  .catch(err => console.error('Error sending to Google Sheets:', err));
}

function showSuggestion(mood) {
  suggestionBox.textContent = suggestions[mood] || "Log your mood to get a tip.";
}

function countMoods(data) {
  // We want to show counts of each mood per day
  // Create a sorted list of dates
  const datesSet = new Set(data.map(d => d.date));
  const dates = Array.from(datesSet).sort();

  // For each mood, create an array of counts per date
  const counts = moodTypes.map(() => Array(dates.length).fill(0));

  data.forEach(({ date, mood }) => {
    const dateIndex = dates.indexOf(date);
    const moodIndex = moodTypes.indexOf(mood);
    if (dateIndex !== -1 && moodIndex !== -1) {
      counts[moodIndex][dateIndex]++;
    }
  });

  return { dates, counts };
}

function updateChart() {
  const { dates, counts } = countMoods(moodData);

  if (window.moodChart) {
    window.moodChart.destroy();
  }

  window.moodChart = new Chart(moodChartCanvas, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: moodTypes.map((mood, i) => ({
        label: mood,
        data: counts[i],
        backgroundColor: moodColors[i]
      }))
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, stepSize: 1 },
        x: { stacked: true },
      },
      plugins: {
        title: {
          display: true,
          text: 'Mood Trends Over Time'
        },
        legend: { position: 'bottom' }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      stacked: true,
      animation: { duration: 800 }
    }
  });
}

function exportToCSV() {
  if (moodData.length === 0) {
    alert('No mood data to export.');
    return;
  }
  const csvRows = [
    ['Date', 'Mood'],
    ...moodData.map(entry => [entry.date, entry.mood])
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mood_data_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = form.date.value;
  const mood = form.mood.value;

  if (!date || !mood) {
    alert('Please select both date and mood.');
    return;
  }

  saveMood(date, mood);
  sendMoodToGoogleSheets(date, mood);
  showSuggestion(mood);
  updateChart();

  form.reset();
});

exportBtn.addEventListener('click', exportToCSV);

// Initialize date input to today
form.date.value = new Date().toISOString().slice(0, 10);

// Load existing data and render chart & suggestions
if (moodData.length > 0) {
  updateChart();
  // Show last logged mood suggestion if any
  showSuggestion(moodData[moodData.length - 1].mood);
}
