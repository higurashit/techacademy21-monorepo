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
    - エラー発生…  
      `request to https://registry.npmjs.org/body-parser failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org`
  - docker run --publish 8000:8080 --detach --name bb bulletinboard:1.0
  - docker rm --force bb

- hello-next

  - Dockerfile
    ```
    FROM node:14.17.0
    WORKDIR /usr/src/app
    ```
  - docker-compose.yml

    ```
    version: '3'
    services:
      app:
        build:
          context: .
          dockerfile: Dockerfile
        volumes:
          - ./:/usr/src/app
        command: sh -c "cd hello-next && npm run dev"
        ports:
          - "3000:3000"

    ```

  - `docker-compose run --rm app npm install create-next-app`

    - 同様のエラーが発生…

      ```
      npm ERR! code EAI_AGAIN
      npm ERR! errno EAI_AGAIN
      npm ERR! request to https://registry.npmjs.org/create-next-app failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org

      npm ERR! A complete log of this run can be found in:
      npm ERR!     /root/.npm/_logs/2022-01-07T05_39_01_804Z-debug.log
      ERROR: 1

      ```

  - [このサイト](https://ondwn.com/blog-20190512/) を見ると、Docker の DNS 設定を docker-compose.yml で行うと良い（下記 dns ディレクティブ）

    ```
    version: '3'
    services:
      app:
        dns: 8.8.8.8 # add this line
        build:
          context: .
          dockerfile: Dockerfile
        volumes:
          - ./:/usr/src/app
        command: sh -c "cd hello-next && npm run dev"
        ports:
          - "3000:3000"

    ```

  - 無事に npm コマンドが実行できた
  - `docker-compose run --rm app npm install create-next-app`

    ```
    Creating hellonext_app_run ... done
    npm WARN saveError ENOENT: no such file or directory, open '/usr/src/app/package.json'
    npm WARN enoent ENOENT: no such file or directory, open '/usr/src/app/package.json'
    npm WARN app No description
    npm WARN app No repository field.
    npm WARN app No README data
    npm WARN app No license field.

    + create-next-app@12.0.7
    updated 1 package and audited 1 package in 1.061s
    found 0 vulnerabilities

    ```
