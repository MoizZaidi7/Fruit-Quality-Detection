const API_BASE = "https://8a23-194-126-177-32.ngrok.io";

export async function predictImage(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
}

export async function getGradCAM(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      body: formData
    });
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    console.error("GradCAM error:", error);
    throw error;
  }
}

export async function getSHAP(imageFiles) {
  const formData = new FormData();
  imageFiles.forEach((file, index) => {
    formData.append(`files`, file);
  });

  try {
    const response = await fetch(`${API_BASE}/shap_explain`, {
      method: 'POST',
      body: formData
    });
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    console.error("SHAP error:", error);
    throw error;
  }
}