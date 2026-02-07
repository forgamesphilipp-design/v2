import { useState } from "react";
import { selectPhotoFromCamera } from "./selectPhotoFromCamera";
import { uploadPhoto } from "./uploadPhoto";
import { repositories } from "../../app/repositories";

export function useMomentCameraFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    const f = await selectPhotoFromCamera();
    setFile(f);
  }

  function cancel() {
    setFile(null);
  }

  async function retry() {
    setFile(null);
    await start();
  }

  async function confirm() {
    if (!file) return;
    setBusy(true);

    const photoUrl = await uploadPhoto(file);

    await repositories.moments.create({
      title: "",
      takenAt: new Date().toISOString(),
      position: { lon: 0, lat: 0 },
      accuracyM: null,
      photoUrl,
      admin: { canton: null, district: null, community: null },
    });

    setFile(null);
    setBusy(false);
  }

  return {
    file,
    busy,
    start,
    cancel,
    retry,
    confirm,
  };
}
