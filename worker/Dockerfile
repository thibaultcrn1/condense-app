FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /worker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN useradd --system --uid 1001 worker && mkdir -p /work /models && chown worker /work /models
USER worker
ENV WORK_DIR=/work PYTHONUNBUFFERED=1 HF_HOME=/models/huggingface HF_HUB_DISABLE_TELEMETRY=1

CMD ["python", "-m", "app.main"]
