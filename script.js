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

function showSuggestion(mood) {
  suggestionBox.textContent = suggestions[mood] || "Log your mood to get a tip.";
  suggestionBox.classList.add("visible");
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
        backgroundColor: moodColors[index]
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
