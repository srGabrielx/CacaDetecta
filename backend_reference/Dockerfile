FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    python3-dev \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Install SAM 2 from Meta
RUN pip3 install --no-cache-dir git+https://github.com/facebookresearch/segment-anything-2.git

COPY cv_service.py .

EXPOSE 8000

CMD ["uvicorn", "cv_service:app", "--host", "0.0.0.0", "--port", "8000"]
