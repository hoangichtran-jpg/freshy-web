import { request } from "../../../shared/api/httpClient";

/* ========================================
   Fetch
======================================== */

export const fetchBanners = async () => {
  try {
    const response = await request.get("banners/all");

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

/* ========================================
   Create
======================================== */

export const createBanner = async ({ title, file, sortOrder = 0 }) => {
  try {
    const formData = new FormData();

    formData.append("title", title);

    formData.append("image", file);

    formData.append("sortOrder", sortOrder);

    const response = await request.post("banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

/* ========================================
   Visibility
======================================== */

export const setBannerVisibility = async (bannerId, active) => {
  try {
    const response = await request.put(`banners/${bannerId}`, null, {
      params: {
        active,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

/* ========================================
   Delete
======================================== */

export const deleteBanner = async (bannerId) => {
  try {
    const response = await request.delete(`banners/${bannerId}`);

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
