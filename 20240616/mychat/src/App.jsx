import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import axios from 'axios';

const App = () => {
  const [systemMessage, setSystemMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [newUserMessage, setNewUserMessage] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('mychatData');
    if (storedData) {
      const { systemMessage, messageHistory, newUserMessage } = JSON.parse(storedData);
      setSystemMessage(systemMessage);
      setMessageHistory(messageHistory);
      setNewUserMessage(newUserMessage);
    }
  }, []);

  useEffect(() => {
    const data = { systemMessage, messageHistory, newUserMessage };
    localStorage.setItem('mychatData', JSON.stringify(data));
  }, [systemMessage, messageHistory, newUserMessage]);

  const handleSendMessage = async () => {
    if (newUserMessage.trim()) {
      const newMessage = { role: "user", content: newUserMessage };
      let messages = [newMessage];
      if (systemMessage.trim()) {
        messages = [{ role: 'system', content: systemMessage }, ...messageHistory, newMessage];
      } else {
        messages = [...messageHistory, newMessage];
      }
      setMessageHistory(messages);
      setNewUserMessage('');

      try {
        const response = await axios.post('http://localhost:3000/chat', { messages });
        const { messages: responseMessages } = response.data;
        setMessageHistory(responseMessages);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <h1>聊天系统</h1>
        <div>
          <button
            className="mr-4 p-2 bg-green-500"
            onClick={() => {
              const message = prompt('请输入系统消息:', systemMessage);
              if (message !== null) {
                setSystemMessage(message);
              }
            }}>
            系统消息
          </button>
          <button
            className="p-2 bg-red-500"
            onClick={() => setMessageHistory([])}>
            清除消息
          </button>
        </div>
      </header>
      <Chat messageHistory={messageHistory} />
      <footer className="flex p-4 bg-gray-200">
        <input
          className="flex-grow p-2 border border-gray-400"
          type="text"
          value={newUserMessage}
          onChange={(e) => setNewUserMessage(e.target.value)}
        />
        <button className="p-2 ml-2 bg-blue-500 text-white" onClick={handleSendMessage}>
          发送
        </button>
      </footer>
    </div>
  );
};

export default App;