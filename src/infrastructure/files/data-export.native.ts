import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { StarterClockExport } from "@/application/ports";

const exportDirectory = new Directory(Paths.cache, "starter-clock-exports");

export function writeStarterClockExport(data: StarterClockExport) {
  exportDirectory.create({ idempotent: true, intermediates: true });
  const file = new File(exportDirectory, `starter-clock-export-${data.exportedAtMs}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));
  return file.uri;
}

export async function shareStarterClockExport(data: StarterClockExport) {
  const uri = writeStarterClockExport(data);
  if (!(await Sharing.isAvailableAsync())) throw new Error("EXPORT_SHARE_UNAVAILABLE");
  await Sharing.shareAsync(uri, {
    mimeType: "application/json",
    dialogTitle: "Export Starter Clock data",
    UTI: "public.json",
  });
  return uri;
}
