# アセット TODO

❌ = 未作成（上から優先度順）、✅ = 作成済み（末尾にまとめて記載）。

---

## 未作成

### 摘果プロトタイプUI用

透過PNG。マーカーは `type` に応じて3種類の実画像を表示し、`size`（%）で表示サイズを変える。摘果カーソルは 128×128 以下の PNG を使用。

| # | ファイル | サイズ | 内容 |
|---|---------|--------|------|
| 1 | `assets/ui/thinning/fruit-red.png` | 48×48px 目安 | 完熟の赤い実（1粒）— `type: red` |
| 2 | `assets/ui/thinning/fruit-green.png` | 48×48px 目安 | 未熟の青緑の実（1粒）— `type: green` |
| 3 | `assets/ui/thinning/fruit-half.png` | 48×48px 目安 | 半熟の白〜ピンクの実（1粒）— `type: half` |
| 4 | `assets/ui/thinning/scissors.png` | 任意（透過） | ハサミ素材（高解像度可） |
| 5 | `assets/ui/thinning/scissors-cursor-128.png` | **128×128**・透過 | 摘果カーソル用（`script/make_thinning_cursor.py` で `scissors.png` から生成） |

### いちご成長段階画像

256×256px / 透過PNG / カジュアルなイラスト調

| # | ファイル | 内容 |
|---|---------|------|
| 6 | `assets/crops/strawberry/strawberry-5.png` | S5 開花期（白い花が複数咲いた状態） |
| 7 | `assets/crops/strawberry/strawberry-6.png` | S6 果実肥大期（緑〜白の小さな実が複数） |
| 8 | `assets/crops/strawberry/strawberry-7.png` | S7 成熟期（白〜ピンク〜赤のグラデーション） |
| 9 | `assets/crops/strawberry/strawberry-8/strawberry-8.png` | S8 収穫可能期（赤い完熟いちごが複数） |

### 土・畑画像

| # | ファイル | 内容 |
|---|---------|------|
| 10 | `assets/crops/soil/soil-ridged.png` | 畝が作られた土 |
| 11 | `assets/crops/soil/soil-mulched.png` | マルチシートが敷かれた土 |

### ステージ遷移アニメーション（低優先・なくても動作する）

| # | ファイル | 内容 |
|---|---------|------|
| 12 | `assets/crops/strawberry/strawberry_stage*to*_400ms.webp` | いちご S1→S2 〜 S7→S8（計7つ） |

---

## 作成済み

| ファイル | 内容 |
|---------|------|
| `assets/crops/strawberry/strawberry-2.png` | S2 定植・活着期（小さな苗） |
| `assets/crops/strawberry/strawberry-3.png` | S3 葉成長期（葉が茂った株） |
| `assets/crops/strawberry/strawberry-4.png` | S4 花芽形成期（つぼみが見え始めた株） |
| `assets/crops/soil/soil-empty.png` | 未使用の土 |
| `assets/crops/soil/soil-tilled.png` | 耕された土 |
| `assets/crops/tomato/tomato_stage1to2_400ms.webp` | トマト S1→S2 遷移アニメーション |
| `assets/ui/thinning/plant-base.png` | 摘果プロト用の株画像（背景） |
