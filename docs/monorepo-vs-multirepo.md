# Monorepo と Multirepo

[Back to Top](./index.md)

## Multirepo とは<sup>[1]</sup>

- サービスやライブラリを複数のリポジトリで管理する方法
- Amazon、Netflix は multi-repo パターンである

---

## Monorepo とは<sup>[2]</sup>

- すべてのサービスやライブラリを単一のリポジトリで管理する方法
- Google、Dropbox、Facebook、Twitter は mono-repo パターンである

---

## AWS × Multirepo での CI/CD パイプライン構成

![multi-repo](./assets/monorepo-vs-multirepo/multi-repo.png)

## AWS × Monorepo での CI/CD パイプライン構成

[この記事](https://aws.amazon.com/jp/blogs/news/integrate-github-monorepo-with-aws-codepipeline-to-run-project-specific-ci-cd-pipelines/)を参考に構築する  
![mono-repo](./assets/monorepo-vs-multirepo/mono-repo.png)

## 実装内容と得た学び（AWS × Multirepo）

- Pros
  - リポジトリと CodePipeline を紐付けやすいため、マネージドをフル活用できる
- Cons
  - それぞれのサービスが小規模の場合、全体のサービスの大きさに比べてリポジトリ管理が煩雑になる

---

## 実装内容と得た学び（AWS × Monorepo）

- Pros
  - サービスが小規模の場合、
  - API とフロントエンドを同時にリリースする場合に、手順が少なくて住む
- ## Cons

---

## 評価

---

[1]: https://blog.thundra.io/mono-or-multi-repository-a-dilemma-in-the-serverless-world
[2]: https://blog.thundra.io/mono-or-multi-repository-a-dilemma-in-the-serverless-world

[Back to Top](./index.md)
