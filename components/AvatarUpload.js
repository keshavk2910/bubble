import { useState } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, User } from 'lucide-react';

export default function AvatarUpload({ currentAvatar, onAvatarChange, size = 'large' }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20', 
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for API
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const session = localStorage.getItem('supabase_session');
          if (!session) {
            alert('Please sign in to upload avatar.');
            return;
          }

          const sessionData = JSON.parse(session);
          const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: e.target.result,
              fileName: file.name,
              fileType: file.type
            }),
          });

          const data = await response.json();
          
          if (response.ok) {
            onAvatarChange && onAvatarChange(data.avatarUrl);
          } else {
            alert(data.details || 'Failed to upload avatar.');
          }
        } catch (error) {
          console.error('Avatar upload error:', error);
          alert('Failed to upload avatar. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Display */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 transition-all ${
          dragOver 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Current Avatar or Placeholder */}
        {currentAvatar ? (
          <Image
            src={currentAvatar}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>

      {/* Upload Instructions */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm font-normal font-sans mb-2">
          {isUploading ? 'Uploading avatar...' : 'Click or drag to upload avatar'}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => document.querySelector('input[type="file"]').click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 text-green-600 text-sm hover:text-green-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </button>
          
          {currentAvatar && !isUploading && (
            <button
              onClick={() => onAvatarChange && onAvatarChange(null)}
              className="flex items-center gap-2 px-3 py-2 text-red-600 text-sm hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
        <p className="text-gray-500 text-xs font-normal font-sans mt-2">
          JPG, PNG or GIF (max 5MB)
        </p>
      </div>
    </div>
  );
}