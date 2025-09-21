import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { ImageData } from '../types';

export const downloadImage = (file: File, filename: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateZIP = async (images: ImageData[]) => {
  const zip = new JSZip();
  
  for (const image of images) {
    if (image.compressed) {
      const filename = `compressed_${image.file.name}`;
      zip.file(filename, image.compressed.file);
    }
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compressed_images_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generatePDF = async (images: ImageData[]) => {
  const pdf = new jsPDF();
  let isFirstImage = true;
  
  for (const image of images) {
    if (image.compressed) {
      if (!isFirstImage) {
        pdf.addPage();
      }
      
      const imgData = await fileToBase64(image.compressed.file);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the page while maintaining aspect ratio
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      
      const imgRatio = img.width / img.height;
      const pageRatio = pageWidth / pageHeight;
      
      let width, height;
      if (imgRatio > pageRatio) {
        width = pageWidth - 20; // 10px margin on each side
        height = width / imgRatio;
      } else {
        height = pageHeight - 20;
        width = height * imgRatio;
      }
      
      const x = (pageWidth - width) / 2;
      const y = (pageHeight - height) / 2;
      
      pdf.addImage(imgData, 'JPEG', x, y, width, height);
      isFirstImage = false;
    }
  }
  
  pdf.save(`compressed_images_${new Date().toISOString().split('T')[0]}.pdf`);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};