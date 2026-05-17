const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with Gemini AI
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API key is missing on the server' });
        }

        // Use the gemini-2.5-flash model and provide a custom system prompt
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "You are AgroBot, a helpful and professional AI dedicated to the Agro-chain platform. Agro-chain is a platform designed to empower farmers by providing fair market prices, information on government agricultural schemes, and a direct supply chain distribution system. Always be polite, concise, and knowledgeable about agriculture, farming best practices, and the Agro-chain platform. If asked about something unrelated to agriculture, gently steer the conversation back to farming or the platform."
        });

        // Start chat with optional history
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            reply: text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message',
            error: error.message
        });
    }
});

module.exports = router;
