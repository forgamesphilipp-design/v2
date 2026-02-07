import { useState } from "react";
import { selectPhotoFromCamera } from "./selectPhotoFromCamera";
import { uploadPhoto } from "./uploadPhoto";
import { repositories } from "../../app/repositories";

export function useMomentCameraFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const f = await selectPhotoFromCamera();
    setFile(f);
  }

  function cancel() {
    if (busy) return;
    setError(null);
    setFile(null);
  }

  async function retry() {
    if (busy) return;
    setError(null);
    setFile(null);
    await start();
  }

  async function confirm() {
    if (!file) return;
    if (busy) return; // verhindert mehrfaches Speichern
    setBusy(true);
    setError(null);

    try {
      // uploadPhoto gibt jetzt den STORAGE-PFAD zurück (z.B. users/<uid>/....jpg)
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
    } catch (e: any) {
      setError(String(e?.message ?? e ?? "Fehler"));
    } finally {
      setBusy(false);
    }
  }

  return {
    file,
    busy,
    error,
    start,
    cancel,
    retry,
    confirm,
  };
}
