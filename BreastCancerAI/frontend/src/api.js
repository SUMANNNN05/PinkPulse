import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

export async function checkHealth() {
  const { data } = await client.get("/health");
  return data;
}

export async function runPrediction(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function runSegmentOnly(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/segment", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function runClassifyOnly(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/classify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
