// Utility to run Tesseract.js OCR in browser
import Tesseract from 'tesseract.js';

export async function runOcrFromDataUrl(dataUrl: string): Promise<string> {
  const result = await Tesseract.recognize(dataUrl, 'eng');
  return result.data.text || '';
}
