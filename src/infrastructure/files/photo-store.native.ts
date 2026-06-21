import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import type { PhotoCandidate, PhotoStore } from "@/application/ports";

const photoDirectory = new Directory(Paths.document, "feeding-photos");

export function managedPhotoUri(relativePath: string) { return new File(photoDirectory, relativePath).uri; }

export class ManagedPhotoStore implements PhotoStore {
  async select(): Promise<PhotoCandidate | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error("PHOTO_PERMISSION_DENIED");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.82, allowsEditing: true });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return null;
    return { uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg", byteSize: asset.fileSize ?? 0 };
  }

  async stage(candidate: PhotoCandidate, feedingId: string) {
    photoDirectory.create({ idempotent: true, intermediates: true });
    const extension = candidate.mimeType === "image/png" ? "png" : "jpg";
    const temporary = new File(photoDirectory, `${feedingId}.pending.${extension}`);
    const source = new File(candidate.uri);
    source.copy(temporary);
    return { temporaryPath: temporary.uri, finalPath: `${feedingId}.${extension}` };
  }

  async commit(temporaryPath: string, finalPath: string) {
    const temporary = new File(temporaryPath);
    const target = new File(photoDirectory, finalPath);
    if (target.exists) target.delete();
    temporary.move(target);
    return { relativePath: finalPath, mimeType: finalPath.endsWith(".png") ? "image/png" : "image/jpeg", byteSize: target.size ?? 0 };
  }

  async remove(relativePath: string) {
    const file = new File(photoDirectory, relativePath);
    if (file.exists) file.delete();
  }
}
