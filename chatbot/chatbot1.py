# chatbot1.py
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import torch
import os

# Bước 1: Load dữ liệu
DATA_PATH = "data.csv"
if not os.path.exists(DATA_PATH):
    pd.DataFrame(columns=["question", "answer"]).to_csv(DATA_PATH, index=False)

df = pd.read_csv(DATA_PATH).fillna("")

# Bước 2: Khởi tạo mô hình và encode câu hỏi
model = SentenceTransformer('all-MiniLM-L6-v2')
question_embeddings = model.encode(df['question'].tolist(), convert_to_tensor=True)

# Bước 3: Hàm lấy câu trả lời
def get_response(user_input):
    input_embedding = model.encode(user_input, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(input_embedding, question_embeddings)[0]
    best_score = torch.max(cos_scores).item()
    best_idx = torch.argmax(cos_scores).item()

    print(f"(Độ tương đồng ngữ nghĩa: {best_score:.2%})")
    if best_score >= 0.7:
        return df.iloc[best_idx]['answer']
    else:
        print("ChatBot ML: Tôi chưa biết câu này. Bạn có muốn dạy tôi không? (y/n)")
        choice = input("Bạn: ").lower().strip()
        if choice == 'y':
            new_answer = input("Nhập câu trả lời: ").strip()
            df.loc[len(df)] = [user_input, new_answer]
            df.to_csv(DATA_PATH, index=False)
            global question_embeddings
            question_embeddings = model.encode(df['question'].tolist(), convert_to_tensor=True)
            return "Cảm ơn bạn! Tôi đã học thêm một điều mới."
        else:
            return "Không sao! Bạn cứ hỏi điều khác nhé."

# Bước 4: Giao tiếp
print("ChatBot ML (Semantic): Xin chào! Gõ 'quit' để thoát.")
while True:
    user_input = input("Bạn: ").strip()
    if user_input.lower() == 'quit':
        break
    print("ChatBot ML:", get_response(user_input))
