import pandas as pd
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import string
import random
import os
import csv

# Tải tài nguyên NLTK
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english') + list(string.punctuation))

def preprocess(text):
    if not isinstance(text, str):
        return ""
    tokens = word_tokenize(text.lower())
    return ' '.join([lemmatizer.lemmatize(w) for w in tokens if w not in stop_words])

# Đọc dữ liệu
df = pd.read_csv("data.csv")
df['processed'] = df['question'].apply(preprocess)

# TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['processed'])

def get_response(user_input):
    global df, X
    processed_input = preprocess(user_input)
    input_vec = vectorizer.transform([processed_input])
    similarities = cosine_similarity(input_vec, X)
    best_match_idx = np.argmax(similarities)
    confidence = similarities[0, best_match_idx]
    print(f"(Độ tự tin: {confidence * 100:.2f}%)")

    if confidence > 0.6:
        return df.iloc[best_match_idx]['answer']
    else:
        # Ghi vào log các câu chưa biết
        with open("unanswered.csv", "a", encoding="utf-8", newline='') as f:
            writer = csv.writer(f)
            writer.writerow([user_input])


        # Hỏi người dùng để học thêm
        print("Tôi chưa học câu này, bạn có thể dạy tôi không?")
        teach = input("Bạn: ").strip()
        if teach:
            # Thêm vào DataFrame, lưu lại và cập nhật TF-IDF
            new_row = pd.DataFrame([[user_input, teach]], columns=['question', 'answer'])
            df = pd.concat([df, new_row], ignore_index=True)
            df.to_csv("data.csv", index=False)
            df['processed'] = df['question'].apply(preprocess)
            
            X = vectorizer.fit_transform(df['processed'])
            return "Cảm ơn bạn, tôi đã ghi nhớ câu trả lời!"
        return "Tôi chưa hiểu câu này!"

print("ChatBot ML: Xin chào! Hãy hỏi tôi điều gì đó (gõ 'quit' để thoát)")
while True:
    user_input = input("Bạn: ")
    if user_input.lower() == 'quit':
        break
    print("ChatBot ML:", get_response(user_input))
