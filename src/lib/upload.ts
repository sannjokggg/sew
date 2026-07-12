import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function uploadToImageKit(file: File): Promise<string | null> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "jpg";

    const result = await imagekit.upload({
      file: buffer,
      fileName: `sewago-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`,
    });

    return result.url;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return null;
  }
}

export async function uploadBufferToImageKit(
  buffer: Buffer,
  fileName: string
): Promise<string | null> {
  try {
    const result = await imagekit.upload({
      file: buffer,
      fileName,
    });
    return result.url;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return null;
  }
}
