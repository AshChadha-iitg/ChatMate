const API_KEY = 'YOUR GEMINI API KEY';
const API_URL = 'YOUR API URL/MODEL NAME (eg: gemini-2.0-flash)';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');

// Theme toggle functionality
function initTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.querySelector('.toggle-icon').textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.querySelector('.toggle-icon').textContent = '🌙';
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        // Switch to dark theme
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('.toggle-icon').textContent = '🌙';
    } else {
        // Switch to light theme
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.querySelector('.toggle-icon').textContent = '☀️';
    }
}

// Initialize theme on page load
initTheme();

// Add event listener for theme toggle
themeToggle.addEventListener('click', toggleTheme);

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser) {
        // Convert markdown-style bold text (**text**) to HTML
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert markdown headings (# text) to HTML
        message = message.replace(/^(#{1,6})\s(.*)$/gm, (match, hashes, text) => {
            const level = hashes.length;
            return `<h${level}>${text}</h${level}>`;
        });

        // Wrap paragraphs in <p> tags
        message = message
            .split('\n\n') // Split on double newlines (paragraph breaks)
            .map(para => para.trim()) // Trim whitespace
            .filter(para => para.length > 0) // Remove empty paragraphs
            .map(para => {
                // Don't wrap headings in <p> tags
                if (para.startsWith('<h')) return para;
                return `<p>${para}</p>`;
            })
            .join('\n');
    }
    
    messageDiv.innerHTML = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessage(botResponse, false);
        } else {
            console.error('Unexpected API response:', data);
            addMessage("Sorry, I couldn't process that request.", false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("Sorry, there was an error processing your request. " + error.message, false);
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
