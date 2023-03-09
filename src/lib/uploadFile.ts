import axios, { AxiosProgressEvent, CanceledError } from "axios";
import { AuthorizeUploadApi } from "@/pages/api/authorize_upload";
import { UploadApiResponse } from "cloudinary";

const uploadFile = async (
  folder: string,
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal
) => {
  try {
    const signData = (
      await axios.post<AuthorizeUploadApi>(
        `/api/authorize_upload`,
        {
          folder,
        },
        { signal }
      )
    ).data;

    const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signData.api_key);
    formData.append("timestamp", signData.timestamp);
    formData.append("signature", signData.signature);
    formData.append("folder", folder);

    return (
      await axios.post<UploadApiResponse>(url, formData, {
        onUploadProgress,
        signal,
      })
    ).data.secure_url;
  } catch (error) {
    if (error instanceof CanceledError)
      console.info(`${file.name} uploading has been canceled`);
  }
};

export default uploadFile;
