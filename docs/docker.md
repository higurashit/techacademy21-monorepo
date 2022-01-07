# Docker について

## Docker, Docker Compose のインストールまで

[WorkSpaces について](./amazon-workspaces.md) を参照

## チュートリアルの実施

[この Qiita](https://qiita.com/zembutsu/items/24558f9d0d254e33088f) や [公式サイト(日本語)](https://docs.docker.jp/get-started/index.html) を参照

- hello-world

  - `docker run hello-world`
  - `docker image ls`

- bulletinborad

  - `mkdir MyProject`
  - `cd MyProject`
  - `git clone https://github.com/dockersamples/node-bulletin-board`
  - `cd node-bulletin-board`
  - `ls -l`
  - `cd bulletin-board-app`
  - `cat Dockerfile`

  ```
  FROM node:current-slim

  WORKDIR /usr/src/app
  COPY package.json .
  RUN npm install

  EXPOSE 8080
  CMD [ "npm", "start" ]

  COPY . .
  ```

  - `docker build --tag bulletinboard:1.0 .`
  - docker run --publish 8000:8080 --detach --name bb bulletinboard:1.0
  - docker rm --force bb
