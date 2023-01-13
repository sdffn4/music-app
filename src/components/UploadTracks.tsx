import { useState } from "react";
import axios from "axios";
import type { Data } from "../types";
import type { ChangeEvent } from "react";

interface UploadingTracks {
  [name: string]: {
    initialFilename: string;
    isUploading: boolean;
    progress: number | undefined;
    artist: string | null;
    title: string | null;
    album: string | null;
    source: string | null;
  };
}

const UploadTracks: React.FC = () => {
  const [uploadingTracks, setUploadingTracks] = useState<UploadingTracks>({});

  const onFilesUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setUploadingTracks({});
    const files = e.target.files;

    /* VALIDATE FILES */
    if (!files || !files.length) return;

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("audio")) {
        console.log(`${file.name} is invalid`);
        continue;
      }

      validFiles.push(file);
      setUploadingTracks((prev) => ({
        ...prev,
        [file.name]: {
          initialFilename: file.name,
          isUploading: true,
          progress: 0,
          artist: null,
          title: null,
          album: null,
          source: null,
        },
      }));
    }

    if (!validFiles.length) return;

    /* SEND FILES TO SERVER*/
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const form = new FormData();
        form.append("media", validFiles[i]);

        axios
          .post<Data>(`/api/upload`, form, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              setUploadingTracks((prev) => ({
                ...prev,
                [validFiles[i].name]: {
                  ...prev[validFiles[i].name],
                  progress: progressEvent.progress,
                },
              }));
            },
          })
          .then((res) => {
            const { title, artist, album, source } = res.data;

            setUploadingTracks((prev) => ({
              ...prev,
              [validFiles[i].name]: {
                ...prev[validFiles[i].name],
                isUploading: false,
                title,
                artist,
                album,
                source,
              },
            }));
          })
          .catch((rej) => console.log(rej));
      }

      e.target.type = "text";
      e.target.type = "file";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="file_upload">
          Files to upload
          <input
            id="file_upload"
            name="file"
            type="file"
            onChange={onFilesUploadChange}
            multiple
          />
        </label>
      </form>
      {Object.entries(uploadingTracks).map((el, index) => {
        const filename = el[0];
        const track = el[1];

        return (
          <div key={index}>
            <div className="border-2 border-white">
              <div className="flex">
                <div>{filename}</div>
                <div>{track.progress}</div>
                <div>{track.isUploading ? "Uploading..." : "Uploaded"}</div>
              </div>

              <div>{track.title}</div>
              <div>{track.artist}</div>
              <div>{track.album}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadTracks;
