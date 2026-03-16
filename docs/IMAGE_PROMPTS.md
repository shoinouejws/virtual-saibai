# 画像生成プロンプト集（Nanobanana Pro用）

## 生成ガイドライン

### 共通設定

| 項目 | 設定 |
|------|------|
| アスペクト比 | 1:1 |
| 出力サイズ | 256×256px 以上（後でリサイズ可） |
| 背景 | 単色の白背景（後から透過処理しやすくするため） |
| 保存形式 | PNG |

### スタイル統一のための共通プロンプト（冒頭に付与）

すべてのプロンプトの先頭に以下の「スタイル指定」を付けてください。
これにより、全画像のテイストが統一されます。

```
スタイル指定（共通前置き）:
Cute flat vector illustration style, soft pastel color palette,
clean simple shapes with gentle outlines, warm and friendly aesthetic,
game asset icon, centered composition, white solid background, 1:1 aspect ratio.
```

---

## トマト（tomato）

### tomato-1.png — 種まき直後の芽

```
[共通前置き] +

A tiny green sprout just emerging from brown soil in a small mound.
Two small cotyledon leaves opening up from a thin stem.
The sprout is very small and delicate, just beginning its life.
The soil is a warm brown color with a slightly moist texture.
The overall feeling is hopeful and fresh, like the very start of growth.
```

### tomato-2.png — 小さな苗

```
[共通前置き] +

A small tomato seedling with 4-6 green leaves growing from a thin green stem.
The plant is about 10cm tall, still young but gaining strength.
The leaves are a fresh bright green with visible leaf veins.
Growing from a small mound of rich brown soil.
The plant looks healthy and growing steadily.
```

### tomato-3.png — 花が咲いた状態

```
[共通前置き] +

A tomato plant in its flowering stage with a sturdy green stem and multiple branches.
Several small yellow star-shaped flowers are blooming among dark green leaves.
The plant is bushy and healthy-looking, about medium height.
Some small green unripe tomato buds are just starting to form near the flowers.
Growing from a mound of rich brown soil.
The scene conveys growth and anticipation of fruit.
```

### tomato-4.png — 赤いトマトが実った状態

```
[共通前置き] +

A fully grown tomato plant with 3-4 bright red ripe tomatoes hanging from its branches.
The tomatoes are round, plump, and glossy with a beautiful red color.
The plant has lush dark green leaves surrounding the fruit.
The plant looks abundant and ready for harvest.
Growing from a mound of rich brown soil.
The scene feels rewarding and celebratory, a successful harvest moment.
```

---

## いちご（strawberry）

### strawberry-1.png — 種まき直後の芽

```
[共通前置き] +

A tiny green sprout just emerging from brown soil in a small mound.
Two small round cotyledon leaves opening up, very close to the ground.
The sprout is very small and low to the soil, characteristic of a strawberry seedling.
The soil is a warm brown color with a slightly moist texture.
The overall feeling is hopeful and fresh, like the very start of growth.
```

### strawberry-2.png — 葉が広がった苗

```
[共通前置き] +

A young strawberry plant with distinctive three-lobed leaves spreading outward.
The plant has 3-4 sets of trifoliate leaves with serrated edges in bright green.
The leaves are spreading low and wide close to the ground, forming a small rosette.
Growing from a small mound of rich brown soil.
The plant looks healthy with a compact, leafy shape typical of strawberry plants.
```

### strawberry-3.png — 白い花が咲いた状態

```
[共通前置き] +

A strawberry plant with several small white five-petaled flowers blooming.
The flowers have white petals with bright yellow centers.
The plant has lush green trifoliate leaves spreading around the flowers.
Small green unripe strawberry buds are starting to form below some flowers.
Growing from a mound of rich brown soil.
The scene conveys beauty and the promise of sweet fruit to come.
```

### strawberry-4.png — 赤いいちごが実った状態

```
[共通前置き] +

A strawberry plant with 3-5 bright red ripe strawberries hanging from stems.
The strawberries are plump with visible seeds on the surface, a vivid red color.
Some strawberries are dangling just above the soil level.
The plant has lush green trifoliate leaves surrounding the ripe fruit.
Growing from a mound of rich brown soil.
The scene feels rewarding and delicious, ready for harvest.
```

---

## 畑の土（オプション・背景素材）

### soil-empty.png — 未使用の土

```
[共通前置き] +

A flat patch of dry, untouched soil viewed from slightly above.
The soil is a muted grayish-brown color, compact and hard-looking.
Some small pebbles and dry patches are visible on the surface.
No plants, no growth, just bare earth waiting to be cultivated.
Square plot of land, simple and minimal.
```

### soil-tilled.png — 耕された土

```
[共通前置き] +

A freshly tilled square patch of soil viewed from slightly above.
The soil is a rich dark brown color, soft and freshly turned.
Visible furrows and ridges from tilling, with a moist and fertile appearance.
The soil looks ready for planting, inviting and prepared.
No plants yet, just beautifully cultivated earth.
Square plot of land, simple and minimal.
```

---

## 生成の手順

### Step 1: スタイル確認

最初にトマトの段階4（実り）を1枚生成し、テイストが好みに合うか確認する。
必要に応じて共通前置きのスタイル指定を調整する。

### Step 2: 一括生成

テイストが決まったら、同じスタイル指定を維持したまま残りの画像を順番に生成する。

### Step 3: 背景透過処理

生成された画像の白背景を透過処理する（remove.bg 等のツールを使用）。

### Step 4: リサイズ・配置

256×256px にリサイズし、以下のパスに配置する:

```
public/assets/crops/
├── tomato-1.png
├── tomato-2.png
├── tomato-3.png
├── tomato-4.png
├── strawberry-1.png
├── strawberry-2.png
├── strawberry-3.png
└── strawberry-4.png
```

---

## 調整のヒント

- **もっとデフォルメしたい場合:** 共通前置きに `chibi style, super deformed proportions` を追加
- **もっとリアル寄りにしたい場合:** `flat vector` を `watercolor painting` や `digital painting` に変更
- **ゲーム感を強めたい場合:** `pixel art style, retro game aesthetic` に変更
- **統一感が出ない場合:** 1枚目の生成結果を参照画像として添付し、「この画像と同じスタイルで」と指示する（Nanobanana Pro の複数画像参照機能を活用）
