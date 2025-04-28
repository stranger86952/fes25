import csv
import os
import requests

# please ensure that there is no error in csv
def download_puzzles(csv_path, img_dir, start_id, end_id):
    os.makedirs(img_dir, exist_ok=True)

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            if row[0].strip('"') == "id":
                continue
            id_str = row[0].strip('"')
            id_num = int(id_str)
            if not (start_id <= id_num <= end_id):
                continue
            original_url = row[5].strip('"')
            if not original_url.startswith('https://puzz.link/p?'):
                print(f"Invalid URL format for id {id_num}: {original_url}")
                continue

            # https://puzz.link/p? + shakashaka/7/7/zmbgbgbq
            puzzle_path = original_url.split('p?')[1]
            image_url = f"https://puzz.link/pv?frame=0&{puzzle_path}"

            try:
                res = requests.get(image_url)
                res.raise_for_status()
                save_path = os.path.join(img_dir, f"{id_num}.png")
                with open(save_path, 'wb') as f:
                    f.write(res.content)
                print(f"Saved {save_path}")
            except Exception as e:
                print(f"Failed to download id {id_num}: {e}")

if __name__ == "__main__":
    try:
        start_id = int(input("Start ID を入力してください: "))
        end_id = int(input("End ID を入力してください: "))
    except ValueError:
        print("数値を入力してください。")
        exit(1)

    download_puzzles(
        csv_path='./puzzles.csv',
        img_dir='./img',
        start_id=start_id,
        end_id=end_id
    )
