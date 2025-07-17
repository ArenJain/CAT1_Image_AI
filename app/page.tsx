import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-4">Intelligent Image Data Extraction</h1>
        <p className="mb-8">Upload an image and extract structured data using OCR, ICR, and AI-powered modes.</p>
      </div>
    </main>
  );
}
