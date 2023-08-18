function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomNumber(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

window.addEventListener('load', async function() {
  const word = document.getElementById('word');
  const options = document.getElementById('options');
  const message = document.getElementById('message');
  const newGameBtn = document.getElementById('newGame');
  const difficultyList = document.getElementById('difficultyList');
  const score = document.getElementById('score');
  const happyEmojiList = ["🐁", "😀", "🤗", "🤠", "🤡", "🥳"];
  const sadEmojiList = ["😔", "😓", "😢", "🙁", "😭", "😳"];
  const difficulties = {
    easy: {label: "Easy", value: 2},
    moderate: {label: "Moderate", value: 4},
    hard: {label: "Hard", value: 6},
    expert: {label: "Expert", value: 8}
  }

  let wordList = [];
  let hasBeenClicked = false;
  let difficulty = difficulties.moderate;
  let chosenLanguage = undefined;
  let chosenWordIndex = 0;
  let scoreTotal = 0;

  newGameBtn.onclick = () => {
    updateScore(0);
    loadWordList();
  }

  (loadWordList = function () {
    fetch('https://raw.githubusercontent.com/jmdeejay/word-association/main/wordList.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        wordList = data;
        console.log("Word list loaded successfully.");
        initialiseGame();
      })
      .catch(error => {
        console.error('Error fetching JSON:', error);
        message.innerHTML = "Error while fetching/parsing the words list.";
        message.classList.add("incorrect");
      })
      .finally(() => {
        newGameBtn.disabled = false;
      });
  })();

  function updateAnswer(option, value, className) {
    message.innerHTML = value;
    option.classList.add(className);
    message.classList.add(className);
  }

  function clearAnswer(option, className) {
    message.innerHTML = "";
    option.classList.remove(className);
    message.classList.remove(className);
  }

  function updateScore(value) {
    scoreTotal = value;
    localStorage.setItem("score", value);
    score.innerHTML = `Score: ${value}`;
  }

  function updateDifficulty(value) {
    difficulty = value;
    const dropdownLabel = document.getElementsByClassName('dropdown-btn')[0];
    dropdownLabel.children[0].textContent = value.label;
    localStorage.setItem("difficulty", JSON.stringify(value));
  }

  function initialiseGame() {
    if (wordList.length) {
      hasBeenClicked = false;
      difficulty = JSON.parse(localStorage.getItem("difficulty")) || difficulties.moderate;
      const languages = Object.keys(wordList[0]);
      chosenLanguage = languages[getRandomNumber(languages.length)];
      chosenWordIndex = getRandomNumber(difficulty.value);
      scoreTotal = parseInt(localStorage.getItem("score")) || 0;

      options.innerHTML = "";
      message.innerHTML = "";
      difficultyList.innerHTML = "";
      shuffleArray(wordList);
      word.innerHTML = wordList[chosenWordIndex][chosenLanguage];
      populateOptions();
      populateDifficulties();
      updateDifficulty(difficulty);
      updateScore(scoreTotal);
      console.log("Game successfully initialised.");
    } else {
      message.innerHTML = "List must have at least one entry.";
      message.classList.add("incorrect");
    }
  }

  function populateOptions() {
    wordList.slice(0, difficulty.value).forEach(word => {
      const option = document.createElement('div');
      option.className = 'option';
      option.textContent = chosenLanguage === "french" ? word.lebanese : word.french;
      option.addEventListener('click', () => checkAnswer(option, word));
      options.appendChild(option);
    });
  }

  function populateDifficulties() {
    for (const key in difficulties) {
      const entry = difficulties[key];
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = entry.label;
      li.appendChild(a);
      li.addEventListener('click', () => {
        updateDifficulty(difficulties[key] || difficulties.moderate);
        document.getElementById("dropdown").checked = false;
        initialiseGame();
      });
      difficultyList.appendChild(li);
    }
  }

  function checkAnswer(option, word) {
    if (!hasBeenClicked) {
      hasBeenClicked = true;
      const timeout = 1 * 1000;
      if (word[chosenLanguage] === wordList[chosenWordIndex][chosenLanguage]) {
        updateAnswer(option, `Correct! ${happyEmojiList[getRandomNumber(happyEmojiList.length)]}`, "correct");
        updateScore(scoreTotal + 1);
        setTimeout(() => {
          clearAnswer(option, "correct");
          hasBeenClicked = false;
          initialiseGame();
        }, timeout);
      } else {
        updateAnswer(option, `Incorrect! ${sadEmojiList[getRandomNumber(sadEmojiList.length)]}`, "incorrect");
        updateScore(Math.max(0, scoreTotal - 1));
        setTimeout(() => {
          clearAnswer(option, "incorrect");
          hasBeenClicked = false;
        }, timeout);
      }
    }
  }
});
