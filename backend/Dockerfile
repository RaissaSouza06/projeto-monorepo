# Define a imagem de origem base (cria em cima de uma que já esta pronta)
FROM node:24-alpine

# Configura o diretório global do pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV path="$PNPM_HOME:$PATH"

# Define o diretório de trabalho interno do container (a que fica dentro do linux)
WORKDIR /app

# Instala o pnpm globalmente para gerenciar as dependenciais
RUN npm install -g pnpm

# Desativa a restrição do pnpm 11
RUN pnpm config set strict-dep-builds false 

# Copia apenas o manifesto de dependencias 
COPY package.json ./

# Instala as dependencias do projeto 
RUN pnpm install

#Copia todo o restante do código, raiz do projeto p raiz do container
COPY . .

#Expoe a porta padrão LDW
EXPOSE 3000

#Comando para inicializar a aplicação
CMD ["pnpm", "dev"]