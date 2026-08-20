# Define a imagem de origem base (cria em cima d euma que já esta pronta)
FROM node:24-alpine

#Defin o diretório de trabalho interno do container (a que fica dentro do linux)
WORKDIR /app

#Instala o pnpm globalmente para gerenciar as dependenciais
RUN npm install -g pnpm@11.20

#Desativa a restrição do pnpm 11
RUN echo "strictDepBuilds: false" > pnpm-workspace.yaml

#Copi apenas o manifesto de dependencias 
COPY package.json ./

#Instalar as dependencias do projeto 
RUN pnpm install

#Copia todo o restante do código, raiz do projeto p raiz do container
COPY . .

#Expoe a porta padrão LDW
EXPOSE 3000

#Comando para inicializar a aplicação
CMD ["pnpm", "dev"]