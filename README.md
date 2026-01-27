## スーパーハッカー（superhacker）

スーパーハッカー（superhacker）を用いれば、Hacker NewsのAPIをかんたんに呼び出すことができます。  
Hacker Newsの投稿などをJSON形式で、コマンドラインに表示することができるので便利かもしれません。

## インストール

```bash
$ npm install --global @kokiito0926/superhacker
```

## 実行方法

```bash
$ superhacker list
$ superhacker list --limit 10
$ superhacker comment --id 46726480
$ superhacker comments --id 46726480
$ superhacker comments --id 46726480 --format flat
```

## ライセンス

[MIT](LICENSE)
