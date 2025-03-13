// Main elements
const apiKeyInput = document.getElementById('api-key');
const saveKeyButton = document.getElementById('save-key');
const keyStatus = document.getElementById('key-status');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const modelSelect = document.getElementById('model-select');
const temperatureSlider = document.getElementById('temperature');
const tempValue = document.getElementById('temp-value');

// Local storage key
const API_KEY_STORAGE = 'anthropic_api_key';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load saved API key if available
  const savedKey = localStorage.getItem(API_KEY_STORAGE);
  if (savedKey) {
    apiKeyInput.value = savedKey;
    keyStatus.textContent = '✓ API key loaded from storage';
    keyStatus.style.color = 'green';
  }
  
  // Update temperature display
  temperatureSlider.addEventListener('input', () => {
    tempValue.textContent = temperatureSlider.value;
  });
  
  // Handle Enter key in textarea
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Button event listeners
  saveKeyButton.addEventListener('click', saveApiKey);
  sendButton.addEventListener('click', sendMessage);
});

// Save API key to localStorage
function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
    keyStatus.textContent = '✓ API key saved';
    keyStatus.style.color = 'green';
  } else {
    keyStatus.textContent = '✗ Please enter a valid API key';
    keyStatus.style.color = 'red';
  }
}

// Send message to Anthropic API
async function sendMessage() {
  const userMessage = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  const temperature = parseFloat(temperatureSlider.value);
  
  if (!userMessage) return;
  if (!apiKey) {
    keyStatus.textContent = '✗ Please enter your API key';
    keyStatus.style.color = 'red';
    return;
  }
  
  // Add user message to chat
  addMessageToChat('user', userMessage);
  userInput.value = '';
  
  // Show loading indicator
  const loadingId = showLoading();
  
  try {
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 4000,
        temperature: temperature
      })
    });
    
    // Remove loading indicator
    removeLoading(loadingId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    
    // Add assistant response to chat
    if (data.content && data.content.length > 0) {
      addMessageToChat('assistant', data.content[0].text);
    }
  } catch (error) {
    // Remove loading indicator if there was an error
    removeLoading(loadingId);
    
    // Display error message
    addErrorMessage(error.message);
    console.error('Error:', error);
  }
}

// Add message to chat window
function addMessageToChat(role, content) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', role);
  
  const roleLabel = document.createElement('div');
  roleLabel.classList.add('role-label');
  roleLabel.textContent = role === 'user' ? 'You' : 'Claude';
  
  const contentElement = document.createElement('div');
  contentElement.classList.add('content');
  
  // Convert markdown-style code blocks to HTML
  const formattedContent = content
    .replace(/```(\w*)([\s\S]*?)```/g, (match, language, code) => {
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
  
  contentElement.innerHTML = formattedContent;
  
  messageElement.appendChild(roleLabel);
  messageElement.appendChild(contentElement);
  chatMessages.appendChild(messageElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loading indicator
function showLoading() {
  const loadingId = Date.now();
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('message', 'assistant', 'loading');
  loadingElement.id = `loading-${loadingId}`;
  
  const roleLabel = document.createElement('div');
  roleLabel.classList.add('role-label');
  roleLabel.textContent = 'Claude';
  
  const contentElement = document.createElement('div');
  contentElement.classList.add('content');
  contentElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  
  loadingElement.appendChild(roleLabel);
  loadingElement.appendChild(contentElement);
  chatMessages.appendChild(loadingElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return loadingId;
}

// Remove loading indicator
function removeLoading(loadingId) {
  const loadingElement = document.getElementById(`loading-${loadingId}`);
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Add error message
function addErrorMessage(errorText) {
  const errorElement = document.createElement('div');
  errorElement.classList.add('message', 'error');
  
  const contentElement = document.createElement('div');
  contentElement.classList.add('content');
  contentElement.textContent = `Error: ${errorText}`;
  
  errorElement.appendChild(contentElement);
  chatMessages.appendChild(errorElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}