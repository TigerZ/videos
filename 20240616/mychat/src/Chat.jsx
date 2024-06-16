import React from 'react';
import ReactMarkdown from 'react-markdown';

const Chat = ({ messageHistory }) => {
  return (
    <div className="flex flex-col flex-grow p-4 overflow-auto">
      {messageHistory.map((message, index) => {
        // 过滤掉 system 和 tool 角色的信息
        if (message.role === 'system' || message.role === 'tool') {
          return null;
        }

        if (!message || !message.content) {
          return null;
        }

        const isUser = message.role === 'user';
        const bubbleClass = isUser ? 'bg-blue-200' : 'bg-gray-200';
        const textAlign = isUser ? 'text-right' : 'text-left';

        let content;
        try {
          content = JSON.parse(message.content);
        } catch (e) {
          content = { type: 'text', content: message.content };
        }

        return (
          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`py-2 px-4 rounded ${bubbleClass} ${textAlign}`}>
              {content && content.type === 'audio' ? (
                <audio controls>
                  <source src={content.url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <ReactMarkdown>{content.content}</ReactMarkdown>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Chat;