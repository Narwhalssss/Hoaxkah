from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
from langchain_ollama.llms import OllamaLLM
from fastapi.middleware.cors import CORSMiddleware



class InputData(BaseModel):
    title: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

persist_directory = "./chroma.sqlite3"

embedding_function = OllamaEmbeddings(model="all-minilm")
vectorstore2 = Chroma(
    persist_directory=persist_directory,
    embedding_function=embedding_function
)

try:
    retriever2 = vectorstore2.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    print("VectorStore berhasil di-load!")
except Exception as e:
    print("Error:", e)


@app.post("/check")
async def check_article(data: InputData):
    title = data.title
    query = f"Apakah berita atau judul berita berikut ini tentang '{title}' asli atau Hoaks?"
    
    retriever2 = vectorstore2.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    retrieved_docs2 = retriever2.invoke(query)

    if not retrieved_docs2:
        return {
            "decision": "HOAKS",
            "explanation": "Tidak ada informasi yang relevan ditemukan dalam dokumen yang tersedia.",
            "confidence": 0
        }

    context2 = ' '.join([doc.page_content for doc in retrieved_docs2])
    query_embedding = embedding_function.embed_query(title)
    doc_embeddings = [embedding_function.embed_query(doc.page_content) for doc in retrieved_docs2]
    similarities = [cosine_similarity([query_embedding], [doc_embedding])[0][0] for doc_embedding in doc_embeddings]

    llm = OllamaLLM(model="llama3.2:1b")
    response = llm.invoke(f"Title: {title}\nContext: {context2}")
    return {
        "decision": response.get("decision", "HOAKS"),
        "explanation": response.get("explanation", "Tidak ada bukti yang cukup."),
        "confidence": response.get("confidence", 50)
    }
