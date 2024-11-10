Built with React, allowing users to upload a PDF document, submit questions about its content, and receive answers. It integrates a backend API (e.g., using FastAPI) to process the PDF and extract answers to user-submitted questions.

Project Overview:

PDF Upload: Users can select and upload a PDF document. This document is sent to the backend server, where it can be stored or processed for text extraction.

Question Answering: Users type in questions related to the uploaded PDF's content. Upon submitting a question, the question is sent to the backend, which uses natural language processing (NLP) to extract answers from the PDF text and return them to the user.

Frontend Display: The frontend shows the uploaded PDF status, lets users ask questions, and displays the question-answer pairs in a list format. 

![Screenshot (516)](https://github.com/user-attachments/assets/3d6779ea-52e0-46c3-bde4-f82d516591ed)
