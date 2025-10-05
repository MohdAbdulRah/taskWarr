import React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const ProofSubmissionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [submissionType, setSubmissionType] = useState(null); // 'file' or 'url'
  const [proofInputs, setProofInputs] = useState(['']);
  const [proofFiles, setProofFiles] = useState([null]);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  // Cloudinary config - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dzdlngebr';
  const CLOUDINARY_UPLOAD_PRESET = 'my_app_uploads';

  const resetModal = () => {
    setSubmissionType(null);
    setProofInputs(['']);
    setProofFiles([null]);
    setUploadedUrls([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // URL submission handlers
  const handleProofChange = (index, value) => {
    const newInputs = [...proofInputs];
    newInputs[index] = value;
    setProofInputs(newInputs);
  };

  const addMoreProofInput = () => {
    setProofInputs([...proofInputs, '']);
  };

  const removeProofInput = (index) => {
    if (proofInputs.length > 1) {
      const newInputs = proofInputs.filter((_, i) => i !== index);
      setProofInputs(newInputs);
    }
  };

  // File submission handlers
  const handleFileChange = (index, file) => {
    const newFiles = [...proofFiles];
    newFiles[index] = file;
    setProofFiles(newFiles);
  };

  const addMoreFileInput = () => {
    setProofFiles([...proofFiles, null]);
  };

  const removeFileInput = (index) => {
    if (proofFiles.length > 1) {
      const newFiles = proofFiles.filter((_, i) => i !== index);
      setProofFiles(newFiles);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    try {
        const ext = file.name.split(".").pop().toLowerCase();
        let resourceType = "image"; // default
      
        if (["pdf", "doc", "docx", "txt"].includes(ext)) {
          resourceType = "raw"; // force raw bucket
        }
      
        const url = `https://api.cloudinary.com/v1_1/dzdlngebr/${resourceType}/upload`;
      
        const response = await fetch(
            url,
            {
              method: "POST",
              body: formData,
            }
          );
      
      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let proofData = [];

      if (submissionType === 'url') {
        // Filter out empty URLs
        proofData = proofInputs.filter(url => url.trim() !== '');
        if (proofData.length === 0) {
          toast.error('Please provide at least one proof URL');
          return;
        }
      } else if (submissionType === 'file') {
        // Upload files to Cloudinary
        const filesToUpload = proofFiles.filter(file => file !== null);
        if (filesToUpload.length === 0) {
          toast.error('Please select at least one file');
          return;
        }

        toast.info('Uploading files...');
        for (const file of filesToUpload) {
          const uploadedUrl = await uploadToCloudinary(file);
          proofData.push(uploadedUrl);
        }
      }

      // Call the parent's submit handler
      await onSubmit(proofData);
      
      // Reset the modal on successful submission
      resetModal();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit proof. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-black relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-3 text-gray-700 hover:text-red-500 text-xl font-bold"
          onClick={handleClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-semibold mb-4 text-center">Submit Proof</h2>

        {/* Type Selection */}
        {!submissionType && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Choose how you want to submit your proof:
            </p>
            
            <button
              onClick={() => setSubmissionType('file')}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">Upload Files</span>
              <span className="text-sm text-gray-500">Images, PDFs, Documents</span>
            </button>

            <button
              onClick={() => setSubmissionType('url')}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="font-medium">Submit URLs</span>
              <span className="text-sm text-gray-500">Links to your proof</span>
            </button>
          </div>
        )}

        {/* URL Form */}
        {submissionType === 'url' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Proof URLs</h3>
              <button
                type="button"
                onClick={() => setSubmissionType(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back
              </button>
            </div>

            {proofInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  placeholder={`Proof URL ${index + 1}`}
                  value={input}
                  onChange={(e) => handleProofChange(index, e.target.value)}
                  required={index === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {proofInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProofInput(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMoreProofInput}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add another URL
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit URLs'
              )}
            </button>
          </form>
        )}

        {/* File Form */}
        {submissionType === 'file' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Upload Files</h3>
              <button
                type="button"
                onClick={() => setSubmissionType(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back
              </button>
            </div>

            {proofFiles.map((file, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                      required={index === 0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </label>
                  {proofFiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFileInput(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
                {file && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMoreFileInput}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add another file
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Files'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProofSubmissionModal;