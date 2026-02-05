
# vector.py
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os

embeddings = OllamaEmbeddings(model="mxbai-embed-large")
db_location = "./chrome_langchain_db"

vectorstore = Chroma(
    collection_name="flashcard_knowledge",
    embedding_function=embeddings,
    persist_directory=db_location
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

def add_flashcards_to_chroma(flashcards: list[dict]):
    docs = [
        Document(page_content=f"{fc['question']} {fc['answer']}")
        for fc in flashcards
    ]
    vectorstore.add_documents(docs)
