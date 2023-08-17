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

  const word = document.getElementById('word');
  const options = document.getElementById('options');
  const message = document.getElementById('message');
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

  function initialiseGame() {
    if (wordList.length) {
      hasBeenClicked = false;
      const languages = Object.keys(wordList[0]);
      chosenLanguage = languages[getRandomNumber(languages.length)];
      chosenWordIndex = getRandomNumber(listLimit);

      shuffleArray(wordList);
      word.innerHTML = wordList[chosenWordIndex][chosenLanguage];
      options.innerHTML = "";
      message.innerHTML = "";
      wordList.slice(0, listLimit).forEach(word => {
        const option = document.createElement('div');
        option.className = 'option';
        option.textContent = chosenLanguage === "french" ? word.lebanese : word.french;
        option.addEventListener('click', () => checkAnswer(option, word));
        options.appendChild(option);
      });
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
        setTimeout(() => {
          clearAnswer(option, "correct");
          hasBeenClicked = false;
          initialiseGame();
        }, timeout);
      } else {
        updateAnswer(option, `Incorrect! ${sadEmojiList[getRandomNumber(sadEmojiList.length)]}`, "incorrect");
        setTimeout(() => {
          clearAnswer(option, "incorrect");
          hasBeenClicked = false;
        }, timeout);
      }
    }
  }
});
