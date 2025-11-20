let currentUser = null;

function handleDot(id) {
  if (id === 1) {
    showChat();
  } else {
    alert('Dot ' + id + ' feature not implemented yet.');
  }
}

function showChat() {
  document.getElementById('dots-grid').style.display = 'none';
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
  document.getElementById('dots-grid').style.display = 'grid';
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
  messages.scrollTop = messages.scrollHeight;
}
