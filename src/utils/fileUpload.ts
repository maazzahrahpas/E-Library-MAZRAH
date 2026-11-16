import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

const MAX_INLINE_PDF_BYTES = 600 * 1024; // ~600 KB binary -> ~800 KB base64 (safely under 1 MiB Firestore limit)
const MAX_STORAGE_PDF_BYTES = 20 * 1024 * 1024; // 20 MB limit

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an uploaded cover photo in the browser to a crisp JPEG Data URL (~30-70 KB)
 * so it uploads instantaneously and works reliably without URL input or Storage CORS issues.
 */
export async function compressCoverImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File sampul harus berupa gambar (JPG, PNG, atau WebP).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar sampul.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
    image.src = rawDataUrl;
  });

  const maxW = 540;
  const maxH = 760;
  let width = img.width;
  let height = img.height;

  if (width > maxW || height > maxH) {
    const ratio = Math.min(maxW / width, maxH / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return rawDataUrl;
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let compressed = canvas.toDataURL('image/jpeg', 0.8);
  // Ensure even high-detail cover images stay compact for Firestore
  if (compressed.length > 220 * 1024) {
    compressed = canvas.toDataURL('image/jpeg', 0.65);
  }
  return compressed;
}

export interface UploadedPdfResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  storageType: 'firebase-storage' | 'firestore-inline';
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file PDF.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an E-Book PDF to Firebase Storage when available,
 * with automatic fallback to inline Data URL for PDFs <= 600 KB if Firebase Storage rules aren't enabled yet.
 */
export async function uploadPdfFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadedPdfResult> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('File E-Book harus berformat PDF (.pdf).');
  }
  if (file.size > MAX_STORAGE_PDF_BYTES) {
    throw new Error('Ukuran file PDF terlalu besar (maksimal 20 MB).');
  }

  // Try Firebase Storage first
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `ebooks/${Date.now()}_${safeName}`);

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/pdf'
      });

      const timeoutId = window.setTimeout(() => {
        try {
          uploadTask.cancel();
        } catch {
          // ignore
        }
        reject(new Error('storage/timeout'));
      }, 18000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(pct);
          }
        },
        (err) => {
          window.clearTimeout(timeoutId);
          reject(err);
        },
        async () => {
          window.clearTimeout(timeoutId);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    if (onProgress) onProgress(100);
    return {
      fileUrl: downloadUrl,
      fileName: file.name,
      fileSize: file.size,
      storageType: 'firebase-storage'
    };
  } catch (storageErr) {
    console.warn('Firebase Storage upload fallback check:', storageErr);

    // Fallback: store compact PDF (<= 600 KB) directly so it works even before Storage rules are configured
    if (file.size <= MAX_INLINE_PDF_BYTES) {
      if (onProgress) onProgress(60);
      const dataUrl = await readFileAsDataUrl(file);
      if (onProgress) onProgress(100);
      return {
        fileUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        storageType: 'firestore-inline'
      };
    }

    throw new Error(
      'Gagal mengunggah PDF besar ke Firebase Storage. Pastikan Firebase Storage aktif dan rules mengizinkan upload, atau kompres ukuran PDF hingga di bawah 600 KB.'
    );
  }
}
