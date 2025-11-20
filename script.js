let currentUser = null;

function handleDot(id) {
  if (id === 1) {
    showChat();
  } else if (id === 11) {
    showGame();
  } else {
    alert('Dot ' + id + ' feature not implemented yet.');
  }
}

function showChat() {
  document.querySelector('.dots-grid').style.display = 'none';
  document.getElementById('chat-modal').style.display = 'flex';
  document.getElementById('thread-dots').style.display = 'block';
  document.getElementById('chat-interface').style.display = 'none';
  document.getElementById('chat-title').textContent = 'Text Threads';
}

function selectThread(thread) {
  currentUser = thread;
  document.getElementById('thread-dots').style.display = 'none';
  document.getElementById('chat-interface').style.display = 'flex';
  document.getElementById('chat-title').textContent = 'Texting ' + thread;
  loadMessages(thread);
}

function backToDots() {
  document.querySelector('.dots-grid').style.display = 'grid';
  document.getElementById('chat-modal').style.display = 'none';
  currentUser = null;
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const msg = input.value.trim();
  if (msg && currentUser) {
    try {
      const messagesList = JSON.parse(localStorage.getItem('chat_' + currentUser) || '[]');
      const newMessage = { sender: 'You', text: msg, timestamp: Date.now(), read: true };
      messagesList.push(newMessage);
      localStorage.setItem('chat_' + currentUser, JSON.stringify(messagesList));
      displayMessage(newMessage);
      input.value = '';

      // Simulate a reply if bot
      if (currentUser === 'Bot') {
        setTimeout(() => {
          try {
            const reply = { sender: currentUser, text: 'Hello! This is a bot reply.', timestamp: Date.now(), read: false };
            messagesList.push(reply);
            localStorage.setItem('chat_' + currentUser, JSON.stringify(messagesList));
            displayMessage(reply);
          } catch (e) {
            console.error('Error saving bot reply:', e);
          }
        }, 1000);
      }
    } catch (e) {
      alert('Unable to save message. Local storage might be full.');
      console.error('LocalStorage error:', e);
    }
  }
}

function loadMessages(user) {
  const messages = document.getElementById('messages');
  messages.innerHTML = '';
  const messagesList = JSON.parse(localStorage.getItem('chat_' + user) || '[]');
  messagesList.forEach(displayMessage);
}

function displayMessage(msg) {
  const messages = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  const isYou = msg.sender === 'You';
  messageDiv.innerHTML = `<p class="chat-message ${isYou ? 'you' : 'them'}"><strong>${msg.sender}:</strong> ${msg.text}</p>`;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollTop;
}

// Word Game Variables
let wordOfTheDay = '';
let currentAttempt = 0;
const maxAttempts = 6;
const gameWordLength = 5;
const words = ['apple', 'grape', 'world', 'hello', 'beach', 'light', 'earth', 'swift', 'black', 'white'];

function showGame() {
  console.log('Showing game modal');
  document.querySelector('.dots-grid').style.display = 'none';
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  initGame();
}

function initGame() {
  console.log('Initializing game');
  // Pick word based on current date
  const today = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  wordOfTheDay = words[today % words.length].toUpperCase();
  currentAttempt = 0;
  document.getElementById('game-board').innerHTML = '';
  document.getElementById('game-input').value = '';
  document.getElementById('game-message').textContent = '';

  for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement('div');
    row.classList.add('game-row');
    for (let j = 0; j < gameWordLength; j++) {
      const cell = document.createElement('div');
      cell.classList.add('game-letter');
      cell.textContent = '?'; // Placeholder for visibility
      row.appendChild(cell);
    }
    document.getElementById('game-board').appendChild(row);
  }
  console.log('Game board created with', maxAttempts, 'rows of', gameWordLength, 'letters');
  console.log('Word of the day:', wordOfTheDay);
}

function submitGuess() {
  console.log('Submit guess called');
  const input = document.getElementById('game-input');
  const guess = input.value.toUpperCase().trim();
  const message = document.getElementById('game-message');

  if (guess.length !== gameWordLength) {
    message.textContent = 'Please enter a 5-letter word.';
    return;
  }

  if (currentAttempt >= maxAttempts) {
    return;
  }

  const row = document.getElementById('game-board').children[currentAttempt];
  for (let i = 0; i < gameWordLength; i++) {
    const letter = row.children[i];
    letter.textContent = guess[i];
    if (wordOfTheDay[i] === guess[i]) {
      letter.classList.add('correct');
    } else if (wordOfTheDay.includes(guess[i])) {
      letter.classList.add('present');
    } else {
      letter.classList.add('absent');
    }
  }

  currentAttempt++;
  input.value = '';

  if (guess === wordOfTheDay) {
    message.textContent = 'Congratulations! You win!';
  } else if (currentAttempt >= maxAttempts) {
    message.textContent = `Game over! The word was ${wordOfTheDay}.`;
  }
}

// Handle enter key for submit
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('game-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  });
});

function backToGameDots() {
  document.querySelector('.dots-grid').style.display = 'grid';
  document.getElementById('game-modal').style.display = 'none';
  currentAttempt = 0;
}
