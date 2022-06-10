FROM ubuntu:latest
FROM python:3.6-slim

WORKDIR /app

COPY requirement.txt /app

RUN apt-get update && apt-get install -y libzbar-dev
RUN apt-get install -y libssl-dev
# RUN apt install libgl1-mesa-glx
RUN apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install --no-cache-dir -r requirement.txt
RUN pip install --upgrade pip setuptools wheel

RUN pip install uvicorn==0.15.0

RUN pip install fastapi==0.70.0

RUN pip install python-multipart

COPY . /app

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]