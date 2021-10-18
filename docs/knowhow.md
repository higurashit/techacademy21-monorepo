# ノウハウ集

[Back to Top](./index.md)

- マイクロサービスは DB を分けるべきか？
  - It Depends On
  - アジリティとリスクのどちらを取るか（分けてもよいが処理の複雑度が上がる）
- 共通処理が多い既存オンプレアプリをドメイン分割してマイクロサービス化するには
  - 既存のアプリの作り次第（言語、フレームワーク）
  - ドメインを再定義して作り直しが多い
  - 共通機能は単純なものは各サービスで作成、メンテナンスする（共通機能を改修したときの影響範囲を狭めるため）

---

[Back to Top](./index.md)