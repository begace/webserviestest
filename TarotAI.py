import openai
import random

MAXTOKENS = 3000

openai.api_key = "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"

def read_tarot_file(file_path):
    tarot_data = {}
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            card_name, upright, reversed_ = line.strip().split("|")  # 수정된 부분
            tarot_data[card_name] = {"정방향": upright.split(":")[1].strip(), "역방향": reversed_.split(":")[1].strip()}
    return tarot_data

def chat_with_gpt(prompt, openai_api_key):
    responses = []

    while True:
        completions = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=MAXTOKENS,
            n=1,
            stop=None,
            temperature=0.8,
            api_key=openai_api_key,
        )

        response = completions.choices[0].message['content'].strip()
        responses.append(response)

        if completions['usage']['total_tokens'] < MAXTOKENS:
            break
        else:
            prompt = "이어서 설명해주세요."

    return " ".join(responses)

def draw_cards(num_cards, tarot_data):
    cards = random.sample(list(tarot_data.keys()), num_cards)  # 수정된 부분
    drawn_cards = []
    for card in cards:
        card_position = random.choice(["정방향", "역방향"])
        drawn_cards.append((card, card_position))
    return drawn_cards

def main():
    tarot_data = read_tarot_file("Tarot.txt")

    category = input("어떤 점을 보고 싶으세요? (금전, 사랑, 건강 등): ")
    num_cards = int(input("몇 장의 카드를 뽑으시겠어요? (3 또는 5): "))

    drawn_cards = draw_cards(num_cards, tarot_data)

    print(f"\n{category}에 대한 카드 해석입니다:")
    for card, position in drawn_cards:
        print(f"{card}:")
        print(f"{position}: {tarot_data[card][position]}\n")

    cards_str = ', '.join([f"{card} ({position})" for card, position in drawn_cards])
    gpt_response = chat_with_gpt(f"{category}에 대해 {num_cards}장의 카드를 뽑았습니다. {cards_str}", openai.api_key)
    print("챗봇:", gpt_response)

if __name__ == "__main__":
    main()
