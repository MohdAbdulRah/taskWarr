import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Select a file first');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData, // Do NOT set Content-Type manually
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('Backend returned:', data);
      setFileUrl(data.url);
      alert('Upload successful!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading} style={{ marginLeft: '10px' }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {fileUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Uploaded File URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a>

          {fileUrl.endsWith('.pdf') && (
            <iframe
              src={fileUrl}
              width="100%"
              height="600px"
              title="PDF Viewer"
              style={{ marginTop: '10px', border: '1px solid #ccc' }}
            ></iframe>
          )}

          {fileUrl.endsWith('.txt') && (
            <iframe
              src={fileUrl}
              width="100%"
              height="400px"
              title="TXT Viewer"
              style={{ marginTop: '10px', border: '1px solid #ccc' }}
            ></iframe>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;


