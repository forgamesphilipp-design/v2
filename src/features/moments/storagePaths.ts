export function userPhotosPrefix(uid: string) {
    return `users/${uid}/photos`;
  }
  
  export function makeUserPhotoPath(uid: string, fileName: string) {
    return `${userPhotosPrefix(uid)}/${fileName}`;
  }
  