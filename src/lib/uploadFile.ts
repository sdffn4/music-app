import axios from "axios";
import { AuthorizeUploadApi } from "@/pages/api/authorize_upload";
import { UploadApiResponse } from "cloudinary";

const uploadFile = async (folder: string, file: File) => {
  const signData = (
    await axios.post<AuthorizeUploadApi>(`/api/authorize_upload`, {
      folder,
    })
  ).data;

  const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", folder);

  return (await axios.post<UploadApiResponse>(url, formData)).data.secure_url;
};

export default uploadFile;
