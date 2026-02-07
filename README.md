## superhacker

superhackerは、Hacker NewsのAPIを利用して、ストーリーやコメントをJSON形式で取得することができるコマンドラインのツールです。  
JSON形式でストーリーやコメントを取得することができるので、jqなどでフィルタリングをしやすくなったり、大規模言語モデルに与えやすくなったりします。

## インストール

```bash
$ npm install --global @kokiito0926/superhacker
```

## 使用方法

ストーリーの一覧を表示します。  
--limitのオプションで表示件数を制限することもできます。

```bash
$ superhacker list
$ superhacker list --limit 10
```

コメントのIDを指定して、詳細を取得します。

```bash
$ superhacker comment --id 46726480
```

コメントのIDを指定して、すべての返信を再帰的に取得します。  
デフォルトでは、ツリー構造で取得されますが、フラットな形式で取得することもできます。

```bash
$ superhacker comments --id 46726480
$ superhacker comments --id 46726480 --format flat
```

## ライセンス

[MIT](LICENSE)
