// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { generateTarotResult } = require('./public/tarot-api'); // 여기에서 tarot-api.js의 함수를 불러옵니다.

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // 추가된 코드

app.post('/api/generate-tarot-result', async (req, res) => {
    const { topic, numCards } = req.body;
    const result = await generateTarotResult(topic, numCards);
    res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
