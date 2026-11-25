# syntax=docker/dockerfile:1

FROM node:20-alpine AS web-build
WORKDIR /app
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci
COPY web/ ./web/
RUN cd web && npm run build

FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY api/requirements.txt ./api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api/ ./api/
COPY data/indicateurs/ ./data/indicateurs/
COPY data/geojson/ ./data/geojson/
RUN mkdir -p /app/data/barometre
COPY --from=web-build /app/api/static/ ./api/static/

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000
WORKDIR /app/api
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", \
     "app:create_app()"]
