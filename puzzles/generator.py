from PIL import Image

def resize_and_place_image(img_path, size=(385, 385)):
    with Image.open(img_path) as img:
        img.thumbnail(size, Image.Resampling.LANCZOS)
        new_img = Image.new('RGB', size, (255, 255, 255))
        left = (size[0] - img.width) // 2
        top = (size[1] - img.height) // 2
        new_img.paste(img, (left, top))

        return new_img

def create_final_image(nums, output_path='./img/final_image.png'):
    final_img = Image.new('RGB', (800, 800), (0, 0, 0))
    positions = [(10, 10), (405, 10), (405, 405), (10, 405)]

    for i, num in enumerate(nums):
        img_path = f'./list/thumbnails/{num}.png'
        resized_img = resize_and_place_image(img_path)
        final_img.paste(resized_img, positions[i])

    final_img.save(output_path)
    print(f"画像が保存されました: {output_path}")

if __name__ == '__main__':
    nums = input("左上から時計回りに配置する画像を、スペース区切りで4つ指定してください: ").split()
    create_final_image(nums)
