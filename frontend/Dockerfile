# Imagem base do Nginx
FROM nginx:alpine

# Copiar os arquivos estáticos do frontend para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Expor a porta 80 para o tráfego HTTP
EXPOSE 80

# O Nginx já vem com um comando de inicialização padrão, não precisamos de CMD
