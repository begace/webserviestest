const fs = require('fs');
const openai = require('openai');

openai.apiKey = "sk-f2VxrNXEMj1Q9IBDzEesT3BlbkFJPhBPbhVilZLoMoStIL2";


async function readTarotFile() {
    try {
        const data = await fs.readFile('Tarot.txt', 'utf8');
        const cards = data.split('\n').map(line => {
            const [name, uprightMeaning, reversedMeaning] = line.split('|');
            return {
                name: name.trim(),
                uprightMeaning: uprightMeaning.trim(),
                reversedMeaning: reversedMeaning.trim()
            };
        });
        return cards;
    } catch (err) {
        console.error('Error reading Tarot.txt:', err);
        return [];
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickCards(numCards, tarotCards) {
    const pickedCards = [];

    for (let i = 0; i < numCards; i++) {
        const randomIndex = getRandomInt(0, tarotCards.length - 1);
        const randomCard = tarotCards[randomIndex];
        const isUpright = Math.random() < 0.5;

        pickedCards.push({
            name: randomCard.name,
            imageUrl: `TarotIMG/${randomCard.name}.jpg`,
            orientationMeaning: isUpright ? randomCard.uprightMeaning : randomCard.reversedMeaning
        });
    }

    return pickedCards;
}

async function generateReading(topic, cards) {
    const cardInfo = cards.map(card => `${card.name}: ${card.orientationMeaning}`).join(', ');
    const prompt = `Generate a tarot reading for the topic "${topic}" using the following cards: ${cardInfo}.`;

    try {
        const response = await openai.Completion.create({
            engine: 'text-davinci-002',
            prompt: prompt,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.8,
        });

        if (response.choices && response.choices.length > 0) {
            return response.choices[0].text.trim();
        } else {
            return 'Error generating reading. Please try again.';
        }
    } catch (err) {
        console.error('Error generating reading:', err);
        return 'Error generating reading. Please try again.';
    }
}

async function generateTarotResult(topic, numCards) {
    // 1. readTarotFile 함수를 사용하여 카드 정보를 가져옵니다.
    const tarotCards = await readTarotFile();

    // 2. pickCards 함수를 사용하여 카드를 뽑습니다.
    const pickedCards = pickCards(numCards, tarotCards);

    // 3. generateReading 함수를 사용하여 점괘 해석을 생성합니다.
    const interpretation = await generateReading(topic, pickedCards);

    // 4. 결과를 반환합니다.
    return {
        cards: pickedCards,
        interpretation: interpretation
    };
}

function showCardResult(imageUrl, name, orientationMeaning) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = name;
    cardElement.appendChild(imgElement);

    const nameElement = document.createElement('h3');
    nameElement.textContent = name;
    cardElement.appendChild(nameElement);

    const meaningElement = document.createElement('p');
    meaningElement.textContent = orientationMeaning;
    cardElement.appendChild(meaningElement);

    document.getElementById('cards').appendChild(cardElement);
}

document.getElementById('tarot-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const topic = document.getElementById('topic').value;
    const numCards = document.getElementById('num-cards').value;

    const result = await generateTarotResult(topic, numCards);

    document.getElementById('cards').innerHTML = '';
    document.getElementById('interpretation').innerHTML = '';

    for (const card of result.cards) {
        showCardResult(card.imageUrl, card.name, card.orientationMeaning);
    }

    const interpretationElement = document.createElement('p');
    interpretationElement.textContent = result.interpretation;
    document.getElementById('interpretation').appendChild(interpretationElement);

    document.getElementById('result').classList.remove('d-none');
});