# GitHub Pages の作成

[Back to Top](./index.md)

## リポジトリ構成

Monorepo: `techacademy21-monorepo`  
※本手順はこのリポジトリに GitHub Pages 用の docs ディレクトリを作成する  
※Multirepo 用は `techacademy21-xxxx` とする

---

## 空の GitHub リポジトリを作成

[techacademy21-monorepo](https://github.com/higurashit/techacademy21-monorepo) を作成

---

## GitHub 用の ssh 鍵を作成する

他の ssh 鍵と被らないように、専用のファイル名で ssh 鍵を作成する  
※Git bash で実施する

### ssh 鍵の作成

```sh
$ cd ~/.ssh
$ ssh-keygen -t rsa -f techacademy21-monorepo
$ ls -l
techacademy21-monorepo # 秘密鍵
techacademy21-monorepo.pub # 公開鍵
```

### SSH の config 設定

`~/.ssh/config` を確認し、存在しなければ新規作成する

```sh
$ ls -l ~/.ssh/config
$ touch ~/.ssh/config
$ code ~/.ssh/config
```

`~/.ssh/config` に以下の記述を追記

```text
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

## GitHub と ssh 通信する

### GitHub に公開鍵を登録

[ここ](https://github.com/settings/ssh/new) から公開鍵の新規登録を行う

- `Title`：HOME--techacademy21-monorepo
- `Key`：Ctrl + v でペースト

### SSH 接続確認

```sh
$ ssh -T git@github.com.higurashit
Hi higurashit! You\'ve successfully authenticated, but GitHub does not provide shell access.
```

---

## GiHub Pages への公開

### プロジェクトを作成

```sh
$ ls -l ~/MyProject # 任意のフォルダでOK
$ git clone https://github.com/higurashit/techacademy21-monorepo.git
$ cd techacademy21-monorepo/

$ git config --local user.name higurashit
$ git config --local user.email higurashit@nttdata-bizsys.co.jp
$ git fetch
```

### 公開ページの作成

```sh
$ pwd
~/MyProject/techacademy21-monorepo/

$ mkdir docs
$ echo "# Hello GitHub Pages!" > docs/index.md
$ git add .
$ git commit -m "initial commit."
$ git push origin HEAD
```

### GitHub での公開設定

[ここ](https://github.com/higurashit/techacademy21-monorepo/settings/pages)から GitHub Pages の公開設定を行う（「Repository」→「Settings」→「Pages」）

- `Source`：ブランチ名とドキュメントフォルダ（docs）を設定
- `Theme Chooser`：デザインをテンプレートから作成（自作もできそう）

### 公開ページにアクセスする

「Pages」タブで以下の表示を確認し、ページにアクセスする  
![エビフライトライアングル](./assets/create-github-pages/github-pages-success.png 'サンプル')
[https://higurashit.github.io/techacademy21-monorepo/]()

---

## GitHub Pages Tips

- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [コードブロックの作成と強調表示](https://docs.github.com/ja/github/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)

---

[Back to Top](./index.md)
