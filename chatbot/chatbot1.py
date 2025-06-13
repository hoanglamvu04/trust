import pandas as pd
from sentence_transformers import SentenceTransformer, util
import torch

# 1. Dùng model mạnh hơn
model = SentenceTransformer('all-mpnet-base-v2')  # So với all-MiniLM-L6-v2 thì hiểu ngữ cảnh tốt hơn

# 2. Đọc dữ liệu và gắn nhãn phân loại
df = pd.read_csv("data.csv").fillna("")
df['category'] = df.get('category', 'default')  # nếu chưa có cột category thì gán tạm

# 3. Encode tất cả câu hỏi
question_embeddings = model.encode(df['question'].tolist(), convert_to_tensor=True)

# 4. Context (memory tạm thời)
chat_memory = []

def get_response(user_input):
    # Gộp ngữ cảnh nếu có
    if chat_memory:
        context = " ".join(chat_memory[-3:])  # lấy 3 câu gần nhất
        user_input_with_context = context + " " + user_input
    else:
        user_input_with_context = user_input

    # Encode input có ngữ cảnh
    input_embedding = model.encode(user_input_with_context, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(input_embedding, question_embeddings)[0]

    # Tìm top 3 câu gần nhất
    top_k = min(3, len(df))
    top_results = torch.topk(cos_scores, k=top_k)

    # Nếu câu tốt nhất đủ giống
    if top_results.values[0].item() >= 0.65:
        suggestions = []
        for score, idx in zip(top_results.values, top_results.indices):
            idx = idx.item()
            question = df.iloc[idx]['question']
            answer = df.iloc[idx]['answer']
            category = df.iloc[idx]['category']
            suggestions.append({
                "question": question,
                "answer": answer,
                "score": round(score.item(), 3),
                "category": category
            })

        # Lưu lại input vào context
        chat_memory.append(user_input)

        return {
            "reply": suggestions[0]["answer"],
            "suggestions": suggestions[1:],  # 2 câu gợi ý còn lại
            "category": suggestions[0]["category"]
        }
    else:
        return {
            "reply": "Xin lỗi, tôi chưa hiểu câu này. Bạn có thể hỏi theo cách khác nhé.",
            "suggestions": [],
            "category": "unknown"
        }
