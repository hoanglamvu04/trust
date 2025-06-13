import os
import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load mô hình embedding
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_response(user_input, topic):
    path = f"data/{topic}.csv"
    if not os.path.exists(path):
        return "❗Không tìm thấy danh mục kiến thức phù hợp."

    df = pd.read_csv(path)
    df = df.dropna()

    # Tạo embedding cho các ví dụ
    example_embeddings = model.encode(df['example'].tolist(), convert_to_tensor=True)
    input_embedding = model.encode(user_input, convert_to_tensor=True)

    # Tính độ tương đồng
    scores = util.cos_sim(input_embedding, example_embeddings)[0]
    best_idx = scores.argmax().item()

    return df.iloc[best_idx]['response']
