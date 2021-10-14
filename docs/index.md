# GitHub Pages の作成まで

## リポジトリ構成

Monorepo: techacademy21-monorepo  
Multirepo: techacademy21-xxxx

## リポジトリ設定

[https://github.com/settings/repositories]  
「Repository default branch」→ master

## 空の GitHub リポジトリを作成

https://github.com/higurashit/techacademy21-monorepo

## GitHub に ssh 鍵を登録する

### ssh 鍵の作成

```sh
$ cd ~/.ssh
$ ssh-keygen -t rsa -f techacademy21-monorepo
$ ls -l
techacademy21-monorepo # 秘密鍵
techacademy21-monorepo.pub # 公開鍵
```

### SSH の config 設定（複数の GitHub アカウントがある場合）

```sh
$ ls -l ~/.ssh/config
$ touch ~/.ssh/config
$ code ~/.ssh/config
```

```text:~/.ssh/config
Host github.com.higurashit
  HostName github.com
  User git
  Port 22
  IdentityFile ~/.ssh/techacademy21-monorepo
  TCPKeepAlive yes
  IdentitiesOnly yes
```

### 公開鍵の中身をコピー

```sh
$ cat techacademy21-monorepo.pub | clip
```

### GitHub に公開鍵を登録

https://github.com/settings/ssh/new  
Title：`HOME--techacademy21-monorepo`  
Key：`Ctrl + v` でペースト

### SSH 接続確認

```sh
$ ssh -T git@github.com.higurashit
Hi higurashit! You\'ve successfully authenticated, but GitHub does not provide shell access.
```

### プロジェクトを作成

```sh
$ ls -l ~/MyProject
$ git clone https://github.com/higurashit/techacademy21-monorepo.git
$ cd techacademy21-monorepo/

$ git config --local user.name higurashit
$ git config --local user.email higurashit@nttdata-bizsys.co.jp
$ git fetch
```

### GiHub Pages への公開

### 公開ページの作成

```sh
$ mkdir docs
$ echo "# Hello GitHub Pages!" > docs/index.md
$ git add .
$ git commit -m "initial commit."
$ git push origin HEAD
```

### GitHub での設定

「Repository」→「Settings」→「Pages」で設定

### GitHub Pages Tips

#### GitHub Flavored Markdown Spec

https://github.github.com/gfm/

#### コードブロックの作成と強調表示

https://docs.github.com/ja/github/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks
