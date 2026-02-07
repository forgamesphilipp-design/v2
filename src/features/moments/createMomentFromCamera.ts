import { takePhoto } from "./useCamera";
import { uploadPhoto } from "./uploadPhoto";
import { repositories } from "../../app/repositories";

export async function createMomentFromCamera() {
  const file = await takePhoto();
  const photoUrl = await uploadPhoto(file);

  await repositories.moments.create({
    title: "",
    takenAt: new Date().toISOString(),

    position: { lon: 0, lat: 0 },
    accuracyM: null,

    photoUrl,

    admin: {
      canton: null,
      district: null,
      community: null,
    },
  });
}
