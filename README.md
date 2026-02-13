## superhacker

superhackerは、[Hacker News](https://news.ycombinator.com/)のAPIを利用して、ストーリーやコメントをJSON形式で取得することができるコマンドラインのツールです。  
JSON形式でストーリーやコメントを取得することができるので、jqなどでフィルタリングをしやすくなったり、大規模言語モデルに与えやすくなったりします。

## インストール

```bash
$ npm install --global @kokiito0926/superhacker
```

## 使用方法

ストーリーの一覧を表示します。

```bash
$ superhacker list
```

コメントのIDを指定して、詳細を取得します。

```bash
$ superhacker comment 46726480
```

コメントのIDを指定して、すべての返信を再帰的に取得します。

```bash
$ superhacker comments 46726480
```

## ライセンス

[MIT](LICENSE)
