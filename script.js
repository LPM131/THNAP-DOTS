function handleDot(id) {
  if (id === 1) {
    showChat();
  } else {
    alert('Dot ' + id + ' feature not implemented yet.');
  }
}

function showChat() {
  document.getElementById('chat-modal').classList.remove('hidden');
}

function closeChat() {
  document.getElementById('chat-modal').classList.add('hidden');
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const msg = input.value.trim();
  if (msg) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = '<p><strong>You:</strong> ' + msg + '</p>';
    messages.appendChild(messageDiv);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    // Simulate a reply
    setTimeout(() => {
      const replyDiv = document.createElement('div');
      replyDiv.innerHTML = '<p><strong>Bot:</strong> Hello! This is a simulated text room.</p>';
      messages.appendChild(replyDiv);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
  }
}
