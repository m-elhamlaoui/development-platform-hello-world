FROM python:3.9-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /app /app

CMD ["py", "manage.py", "runserver"]