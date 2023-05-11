// tarot.js
const axios = require('axios');
const fs = require('fs');

const MAXTOKENS = 3000;
const openai_api_key = "sk-f2VxrNXEMj1Q9IBDzEesT3BlbkFJPhBPbhVilZLoMoStIL2";

async function read_tarot_file(file_path) {
  const tarot_data = {};
  const file_content = fs.readFileSync(file_path, { encoding: 'utf-8' });
  file_content.split('\n').forEach(line => {
    const [card_name, upright, reversed_] = line.trim().split('|');
    tarot_data[card_name] = {
      "정방향": upright.split(':')[1].trim(),
      "역방향": reversed_.split(':')[1].trim(),
    };
  });
  return tarot_data;
}

async function chat_with_gpt(prompt) {
  const instance = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Authorization': `Bearer ${openai_api_key}`,
    }
  });

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
    max_tokens: MAXTOKENS,
    n: 1,
    stop: null,
    temperature: 0.8
  };

  const completions = await instance.post('/chat/completions', payload);
  return completions.data.choices[0].message.content.trim();
}

function draw_cards(num_cards, tarot_data) {
  const cards = Object.keys(tarot_data);
  const drawn_cards = [];
  for (let i = 0; i < num_cards; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    const position = Math.random() > 0.5 ? "정방향" : "역방향";
    drawn_cards.push([card, position]);
  }
  return drawn_cards;
}

async function main() {
    const tarot_data = await read_tarot_file("Tarot.txt");
  
    const category = await prompt("어떤 점을 보고 싶으세요? (금전, 사랑, 건강 등): ");
    const num_cards = parseInt(await prompt("몇 장의 카드를 뽑으시겠어요? (3 또는 5): "));
  
    const drawn_cards = draw_cards(num_cards, tarot_data);
  
    console.log(`\n${category}에 대한 카드 해석입니다:`);
  
    for (const [card, position] of drawn_cards) {
      console.log(`${card}:`);
      console.log(`${position}: ${tarot_data[card][position]}\n`);
    }
    
    const cards_str = drawn_cards.map(([card, position]) => `${card} (${position})`).join(', ');
    const gpt_response = await chat_with_gpt(`${category}에 대해 ${num_cards}장의 카드를 뽑았습니다. ${cards_str}`);
    console.log("챗봇:", gpt_response);
  }
  
  
main().catch(console.error);
