import { UploadForm } from '../../components/upload/UploadForm';

export default function UploadPage() {
  return (
    <main className="container">
      <h1>Upload Media</h1>
      <p>Drop an image or video and start ingestion.</p>
      <UploadForm />
    </main>
  );
}
