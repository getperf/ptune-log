その他のセットアップ
============================

ここでは、ObsidianやVSCodeをより効率的に活用するための  
補助プラグインの導入方法を紹介します。  
いずれも公式ストアや拡張機能サイトからインストール可能です。

.. note::
   本章の内容は **任意** のセットアップです。  
   これらのプラグインを導入しなくても基本機能は動作しますが、  
   情報収集やドキュメント作成の効率を高めたい場合に有効です。

対象プラグイン
-----------------------
- `Obsidian Web Clipper <https://github.com/obsidianmd/obsidian-clipper>`_  
  ブラウザ上のWebページを直接Obsidianノートとして保存する拡張機能。
- `copy2md (VSCode Extension) <https://marketplace.visualstudio.com/items?itemName=xycopy.copy2md>`_  
  VSCodeでコピーしたテキストをMarkdownコードブロック形式で整形して貼り付ける拡張機能。

---

Obsidian Web Clipper
-----------------------
**目的**  
ブラウザ上のページを素早くObsidianノートとして保存します。  
技術記事やブログを研究メモとして整理するのに適しています。

**セットアップ手順**

1. 上記リンクからブラウザ拡張をインストールします。  
2. Obsidianを起動し、Vaultのパスを指定します。  
3. 保存テンプレート（例: `clip_{{title}}.md`）を設定します。  
4. ブラウザのツールバーから「Clip to Obsidian」を実行して確認します。

---

copy2md（VSCode 拡張）
-----------------------
**目的**  
VSCode上でコピーしたソースコードをMarkdown形式に自動整形し、  
Obsidianノートへの貼り付けを容易にします。

**セットアップ手順**

1. 上記リンクからVSCode拡張をインストールします。  
2. VSCodeの設定メニューで「Copy as Markdown」を有効化します。  
3. 必要に応じてショートカットキー（例: Ctrl+Alt+C）を割り当てます。  
4. コードをコピーしてObsidianノートへ貼り付け、整形結果を確認します。
