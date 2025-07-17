"use client";
import ImageUpload from "@/components/ImageUpload";

export default function UploadPage() {
  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Upload Image for Data Extraction</h1>
      <ImageUpload />
    </main>
  );
}
