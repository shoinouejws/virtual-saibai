from rembg import remove
from PIL import Image
import os

def remove_checkered_background(input_path, output_path):
    """
    画像の背景（チェック柄など）を透過して保存する関数
    """
    if not os.path.exists(input_path):
        print(f"エラー: {input_path} が見つかりません。")
        return

    print("背景の透過処理を行っています...")
    
    try:
        # 画像の読み込み
        input_image = Image.open(input_path)
        
        # 背景の削除（rembgが被写体を自動認識します）
        output_image = remove(input_image)
        
        # 透過PNGとして保存
        output_image.save(output_path, format="PNG")
        print(f"成功: {output_path} に透過画像を保存しました！")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")

# 実行部分
if __name__ == "__main__":
    input_dir = os.path.join(os.path.dirname(__file__), "remove_bg_target")
    output_dir = os.path.join(os.path.dirname(__file__), "remove_bg_output")

    # 出力フォルダが存在しない場合は作成
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 入力ディレクトリ内の全ファイルを処理
    for filename in os.listdir(input_dir):
        # 画像ファイルのみを対象
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff')):
            input_path = os.path.join(input_dir, filename)
            # 拡張子を.pngに統一して出力
            basename, _ = os.path.splitext(filename)
            output_path = os.path.join(output_dir, f"{basename}.png")
            print(f"{filename} を処理中...")
            remove_checkered_background(input_path, output_path)