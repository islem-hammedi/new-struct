// components/PDFViewer.jsx
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

// components/PDFViewer.jsx
const PDFViewer = ({ fileUrl }) => (
    <iframe 
      src={fileUrl} 
      style={{ width: '100%', height: '500px', border: 'none' }}
      title="PDF Viewer"
    >
      <p>Votre navigateur ne supporte pas les iframes. 
        <a href={fileUrl}>Télécharger le PDF</a>
      </p>
    </iframe>
  );
  
  export default PDFViewer;