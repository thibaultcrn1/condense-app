type UploadedPart = { partNumber: number; etag: string };

const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;

// Uploads `file` straight to object storage using presigned part URLs, so the
// multi-GB VOD never transits through the Next.js server.
export async function uploadMultipart({
  file,
  partSize,
  urls,
  onProgress,
  signal,
}: {
  file: File;
  partSize: number;
  urls: string[];
  onProgress: (uploadedBytes: number) => void;
  signal?: AbortSignal;
}): Promise<UploadedPart[]> {
  const loadedByPart = new Map<number, number>();
  const report = () => {
    let total = 0;
    for (const loaded of loadedByPart.values()) total += loaded;
    onProgress(total);
  };

  const parts: UploadedPart[] = [];
  let next = 0;

  async function runner() {
    while (next < urls.length) {
      const index = next++;
      const partNumber = index + 1;
      const blob = file.slice(index * partSize, (index + 1) * partSize);

      for (let attempt = 1; ; attempt++) {
        try {
          const etag = await putPart(urls[index], blob, signal, (loaded) => {
            loadedByPart.set(partNumber, loaded);
            report();
          });
          parts.push({ partNumber, etag });
          break;
        } catch (error) {
          loadedByPart.set(partNumber, 0);
          report();
          if (signal?.aborted || attempt >= MAX_ATTEMPTS) throw error;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, runner));
  return parts;
}

// XHR rather than fetch: fetch has no upload progress events.
function putPart(
  url: string,
  blob: Blob,
  signal: AbortSignal | undefined,
  onProgress: (loaded: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) {
        onProgress(blob.size);
        resolve(etag);
      } else if (!etag && xhr.status < 300) {
        reject(new Error("ETag manquant : vérifiez la config CORS du bucket (ExposeHeaders)"));
      } else {
        reject(new Error(`Échec de l'envoi (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'envoi"));
    xhr.onabort = () => reject(new DOMException("Envoi annulé", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}
