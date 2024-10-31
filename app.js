class ChatWidget {
    constructor() {
        this.messages = [];
        this.initElements();
        this.loadMessages();
        this.addEventListeners();
        this.API_KEY = "da7b43bb90557ae97d36c0cbf61aa488.477TUMfLPuMNZRW9";
        this.API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
        
        this.addMessage('ai', '你好！我是AI助手，有什么可以帮你的吗？');
    }

    initElements() {
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message');
        this.messagesContainer = document.getElementById('chat-messages');
        this.quickReplyButtons = document.querySelectorAll('.quick-reply-btn');
    }

    loadMessages() {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
            this.renderMessages();
        }
    }

    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    addEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.quickReplyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.sendMessage(btn.textContent));
        });
    }

    async sendMessage(text = null) {
        const message = text || this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';
        this.showLoading();

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('API 请求失败');
            }

            const data = await response.json();
            this.hideLoading();

            if (data.choices && data.choices[0] && data.choices[0].message) {
                this.addMessage('ai', data.choices[0].message.content);
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideLoading();
            this.addMessage('ai', '抱歉，我遇到了一些问题，请稍后再试。');
        }
    }

    addMessage(type, content) {
        const message = {
            type,
            content,
            timestamp: new Date().toLocaleTimeString()
        };
        this.messages.push(message);
        this.renderMessage(message);
        this.saveMessages();
        this.scrollToBottom();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        
        const avatar = document.createElement('img');
        avatar.className = 'message-avatar';
        avatar.src = message.type === 'user' 
            ? 'https://ui-avatars.com/api/?name=User&background=007bff&color=fff'
            : 'https://ui-avatars.com/api/?name=AI&background=ddd&color=333';
        avatar.alt = message.type === 'user' ? '用户' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = message.timestamp;

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        content.appendChild(time);

        this.messagesContainer.appendChild(messageElement);
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading message ai';
        loading.innerHTML = `
            <div class="message-content">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(loading);
        this.scrollToBottom();
    }

    hideLoading() {
        const loading = this.messagesContainer.querySelector('.loading');
        if (loading) loading.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// 初始化聊天小部件
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
}); 