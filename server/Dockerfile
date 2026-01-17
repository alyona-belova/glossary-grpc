FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY proto/glossary.proto .
RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. glossary.proto

COPY glossary_data.py .
COPY main.py .

EXPOSE 5000 50051

CMD ["python", "main.py"]