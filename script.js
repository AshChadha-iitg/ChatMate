const API_KEY = 'AIzaSyCgsgybsh4GK8zy52Rz_mookvfDfC9wfr8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    userInput.value = '';

    // Show loading indicator
    const loadingMessage = addMessageToChat('bot', 'Thinking...');

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('Invalid response from API');
        }

        const botResponse = data.candidates[0].content.parts[0].text;
        
        // Format and display the response
        const formattedResponse = formatResponse(botResponse);
        loadingMessage.innerHTML = formattedResponse;
    } catch (error) {
        console.error('Error:', error);
        loadingMessage.textContent = `Error: ${error.message}`;
    }
}

function formatResponse(text) {
    // Convert line breaks to HTML breaks
    text = text.replace(/\n/g, '<br>');
    
    // Format code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format lists
    text = text.replace(/^\s*[-*]\s+(.+)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    return text;
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    // Use innerHTML for bot messages to render formatted HTML
    if (sender === 'bot') {
        messageElement.innerHTML = message;
    } else {
        messageElement.textContent = message;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}); 
