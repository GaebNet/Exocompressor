export interface ImageData {
  id: string;
  file: File;
  preview: string;
  compressed?: {
    file: File;
    preview: string;
    compressionRatio: number;
    originalSize: number;
    compressedSize: number;
  };
  settings: {
    quality: number;
    format: 'original' | 'jpeg' | 'png' | 'webp';
    maxWidth?: number;
    maxHeight?: number;
    targetSizeMB?: number;
    compressionMode: 'quality' | 'fileSize';
  };
}

export interface CompressionSettings {
  quality: number;
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

export interface EditSettings {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {
    width: number;
    height: number;
  };
}