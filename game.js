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
  let wordList = [];
  let hasBeenClicked = false;
  let chosenLanguage = undefined;
  let chosenWordIndex = 0;
  let scoreTotal = 0;

  const word = document.getElementById('word');
  const options = document.getElementById('options');
  const message = document.getElementById('message');
  const score = document.getElementById('score');
  const happyEmojiList = ["🐁", "😀", "🤗", "🤠", "🤡", "🥳"];
  const sadEmojiList = ["😔", "😓", "😢", "🙁", "😭", "😳"];
  const listLimit = 4;

  await fetch('https://raw.githubusercontent.com/jmdeejay/word-association/main/wordList.json', {
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
    });

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

  function updateScore() {
    localStorage.setItem("score", scoreTotal);
    score.innerHTML = `Score: ${scoreTotal}`;
  }

  function initialiseGame() {
    if (wordList.length) {
      hasBeenClicked = false;
      const languages = Object.keys(wordList[0]);
      chosenLanguage = languages[getRandomNumber(languages.length)];
      chosenWordIndex = getRandomNumber(listLimit);
      scoreTotal = parseInt(localStorage.getItem("score")) || 0;

      shuffleArray(wordList);
      word.innerHTML = wordList[chosenWordIndex][chosenLanguage];
      options.innerHTML = "";
      message.innerHTML = "";
      updateScore();
      wordList.slice(0, listLimit).forEach(word => {
        const option = document.createElement('div');
        option.className = 'option';
        option.textContent = chosenLanguage === "french" ? word.lebanese : word.french;
        option.addEventListener('click', () => checkAnswer(option, word));
        options.appendChild(option);
      });
      console.log("Game successfully initialised.");
    } else {
      message.innerHTML = "List must have at least one entry.";
      message.classList.add("incorrect");
    }
  }

  function checkAnswer(option, word) {
    if (!hasBeenClicked) {
      hasBeenClicked = true;
      const timeout = 1 * 1000;
      if (word[chosenLanguage] === wordList[chosenWordIndex][chosenLanguage]) {
        updateAnswer(option, `Correct! ${happyEmojiList[getRandomNumber(happyEmojiList.length)]}`, "correct");
        scoreTotal += 1;
        updateScore();
        setTimeout(() => {
          clearAnswer(option, "correct");
          hasBeenClicked = false;
          initialiseGame();
        }, timeout);
      } else {
        updateAnswer(option, `Incorrect! ${sadEmojiList[getRandomNumber(sadEmojiList.length)]}`, "incorrect");
        scoreTotal = Math.max(0, scoreTotal - 1);
        updateScore();
        setTimeout(() => {
          clearAnswer(option, "incorrect");
          hasBeenClicked = false;
        }, timeout);
      }
    }
  }
});
