import * as FileSystem from "expo-file-system";

const FOLDER = FileSystem.documentDirectory + "photos/";

export async function listLocalPhotos() {
  try {
    const files = await FileSystem.readDirectoryAsync(FOLDER);
    return files.map((name) => FOLDER + name);
  } catch {
    return [];
  }
}

export async function deleteLocalPhoto(uri: string) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}
