FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets PORT environment variable
ENV PORT=8000
EXPOSE 8000

# Use PORT environment variable for flexibility
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}