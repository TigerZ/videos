const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const functions = require('./functions');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY
});

app.post('/chat', async (req, res) => {
    const { model = process.env.MODEL, messages } = req.body;

    const tools = Object.keys(functions).map(name => functions[name].schema);

    const requestBody = {
        model: model,
        messages: messages,
        tools: tools,
        tool_choice: "auto"
    };

    console.log(JSON.stringify(tools, null, 2));

    try {
        const chatCompletion = await openai.chat.completions.create(requestBody);
        const responseMessage = chatCompletion.choices[0].message;
        
        messages.push({
            role: 'assistant',
            content: responseMessage.content,
            tool_calls: responseMessage.tool_calls
        });

        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls;
            for (let i = 0; i < toolCalls.length; i++) {
                const toolCall = toolCalls[i];
                const toolId = toolCall.id;
                const toolFunction = toolCall.function;
                const toolArguments = JSON.parse(toolFunction.arguments);
                const tool = functions[toolFunction.name];
                const toolResult = await tool.func(toolArguments);
                requestBody.messages.push({
                    role: "tool",
                    content: toolResult,
                    tool_call_id: toolId
                });
                const chatCompletion = await openai.chat.completions.create(requestBody);
                const responseMessage = chatCompletion.choices[0].message;

                messages.push({
                    role: 'assistant',
                    content: responseMessage.content,
                    tool_calls: responseMessage.tool_calls
                });
            }
        }

        console.log(messages);
        
        return res.json({
            messages
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
