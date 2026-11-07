const fileToBase64 = (file, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Could not read the file.'));
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Chuyển đổi ảnh sang WebP
            const dataUrl = canvas.toDataURL('image/webp', quality);
            // const base64String = dataUrl.split(',')[1]; // Loại bỏ tiền tố
            resolve(dataUrl); // Trả về Base64 String
        };

        reader.readAsDataURL(file);
    });
};

export default fileToBase64;
