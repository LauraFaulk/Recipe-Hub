import { UploadForm } from '../../components/upload/UploadForm';

export default function UploadPage() {
  return (
    <main className="container">
      <h1>Upload Media</h1>
      <p>Upload an image, video, or text file and start ingestion.</p>
      <UploadForm />
    </main>
  );
}
