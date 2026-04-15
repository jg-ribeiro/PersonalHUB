# Imagem base
FROM python:3.11-slim

# Diretório de trabalho no container
WORKDIR /app

# Instalar dependências do sistema necessárias para compilar bibliotecas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar apenas o requirements.txt para aproveitar o cache do Docker
COPY requirements.txt .

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código do backend
COPY . .

# Expor a porta que o waitress está usando (conforme server.py)
EXPOSE 8000

# Comando para rodar a aplicação
CMD ["python", "server.py"]
