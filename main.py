from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import os
from langchain_community.embeddings import FakeEmbeddings  
from langchain_community.vectorstores import FAISS  
from transformers import pipeline  

app = FastAPI()

# Allowing CORS for my frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIRECTORY = "./uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

extracted_texts = {}

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
async def main():
    return HTMLResponse("""<html><body>
        <h1>Upload PDF</h1>
        <form action="/upload/" enctype="multipart/form-data" method="post">
            <input name="file" type="file" accept=".pdf">
            <input type="submit">
        </form>
        </body></html>
    """)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    try:
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())
        
        extracted_texts[file.filename] = extract_text_from_pdf(file_location)
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the file: {str(e)}")

def extract_text_from_pdf(pdf_path: str) -> str:
    pdf_text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            pdf_text += page.get_text()
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF file: {str(e)}")
    return pdf_text

@app.post("/ask/")
async def ask_question(question_request: QuestionRequest):
    question = question_request.question
    if not extracted_texts:
        return {"answer": "No PDF files uploaded."}

    last_uploaded_pdf = list(extracted_texts.keys())[-1]
    pdf_text = extracted_texts[last_uploaded_pdf]

    # Log extracted text for debugging
    print(f"Extracted text from {last_uploaded_pdf}: {pdf_text[:500]}")  # First 500 chars
    print(f"Question asked: {question}")

    # Create a question-answering pipeline with a different model
    qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
    
    # Get the answer
    answer = qa_pipeline(question=question, context=pdf_text)
    print(f"Answer returned: {answer['answer']}")  # Log the answer

    return {"answer": answer['answer']}
