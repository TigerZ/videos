const axios = require('axios');
const FormData = require('form-data');

const functions = {
  "TEXT_TO_SPEECH": {
    "schema": {
      "type": "function",
      "function": {
          "name": "TEXT_TO_SPEECH",
          "description": "这是文本转换语音工具。例如：{\"text\": \"你好，有什么需要帮助的吗？\"}",
          "parameters": {
              "type": "object",
              "properties": {
                  "text": {
                      "type": "string",
                      "description": "要转换的文本"
                  }
              },
              "required": ["text"]
          }
      }
    },
    "func": async function (args) {
      const { text } = args;
      console.log('使用 ChatTTS 转语音：', text);

      const formData = new FormData();
      formData.append('text', text);
      try {
        const response = await axios.post('http://127.0.0.1:9966/tts', formData, {
          headers: {
            ...formData.getHeaders()
          }
        });
        const url = response.data.url;
        console.log('转换后的语音：', url);
        return `转换后的语音：${url}`;
      } catch (error) {
        console.error(error);
        return '转换后的失败';
      }
    }
  }
}

module.exports = functions;
