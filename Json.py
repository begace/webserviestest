import json

# Tarot.txt 파일에서 데이터 읽기
with open("Tarot.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

tarot_data = {}

for line in lines:
    if line.strip():  # 빈 줄이 아닌 경우
        key, value = line.strip().split("|", 1)
        tarot_data[key.strip()] = value.strip()

# 데이터를 JSON 형태로 저장하고 TarotJson.txt 파일에 쓰기
with open("TarotJson.txt", "w", encoding="utf-8") as file:
    json.dump(tarot_data, file, ensure_ascii=False, indent=4)
