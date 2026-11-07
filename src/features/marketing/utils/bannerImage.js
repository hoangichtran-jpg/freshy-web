import { BANNER_IMAGE_CONFIG } from "../constants";

/* ========================================
   File size
======================================== */

export const formatFileSizeMB = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) {
    return "0.00MB";
  }

  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

/* ========================================
   MIME validation
======================================== */

export const isSupportedBannerImage = (file) => {
  if (!file) {
    return false;
  }

  return BANNER_IMAGE_CONFIG.acceptedMimeTypes.includes(file.type);
};

/* ========================================
   Image dimensions
======================================== */

export const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    image.onload = () => {
      const result = {
        width: image.naturalWidth,

        height: image.naturalHeight,
      };

      cleanup();

      resolve(result);
    };

    image.onerror = () => {
      cleanup();

      reject(new Error("Không thể đọc kích thước ảnh."));
    };

    image.src = objectUrl;
  });

/* ========================================
   Compress
======================================== */

export const compressBannerImage = (
  file,
  maxSizeMB = BANNER_IMAGE_CONFIG.maxSizeMB,
) =>
  new Promise((resolve, reject) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    /*
     * Không cần compress nếu file
     * đã nằm dưới giới hạn.
     */
    if (file.size <= maxSizeBytes) {
      resolve({
        file,

        compressed: false,

        originalSize: file.size,

        finalSize: file.size,
      });

      return;
    }

    const image = new Image();

    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Trình duyệt không thể xử lý ảnh này."));

        return;
      }

      canvas.width = image.naturalWidth;

      canvas.height = image.naturalHeight;

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      let quality = 0.9;

      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Không thể nén ảnh."));

              return;
            }

            if (blob.size <= maxSizeBytes) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                {
                  type: "image/jpeg",

                  lastModified: Date.now(),
                },
              );

              resolve({
                file: compressedFile,

                compressed: true,

                originalSize: file.size,

                finalSize: blob.size,
              });

              return;
            }

            quality -= 0.1;

            if (quality < 0.35) {
              reject(
                new Error(
                  `Không thể giảm ảnh xuống dưới ${maxSizeMB}MB mà vẫn giữ chất lượng phù hợp.`,
                ),
              );

              return;
            }

            compress();
          },
          "image/jpeg",
          quality,
        );
      };

      compress();
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(new Error("Không thể đọc ảnh."));
    };

    image.src = objectUrl;
  });

/* ========================================
   Main validation / preparation
======================================== */

export const prepareBannerImage = async (file) => {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh quảng cáo.");
  }

  if (!isSupportedBannerImage(file)) {
    throw new Error("Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.");
  }

  const { width, height } = await getImageDimensions(file);

  if (
    width !== BANNER_IMAGE_CONFIG.width ||
    height !== BANNER_IMAGE_CONFIG.height
  ) {
    throw new Error(
      `Ảnh phải có kích thước chính xác ${BANNER_IMAGE_CONFIG.width} × ${BANNER_IMAGE_CONFIG.height}px. Ảnh hiện tại là ${width} × ${height}px.`,
    );
  }

  return compressBannerImage(file);
};
