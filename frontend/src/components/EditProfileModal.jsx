import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Globe, Loader2, User, Mail, Briefcase, MapPin, AlignLeft } from 'lucide-react';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import API from '../api';
import { useNotifications } from './NotificationProvider';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const { addToast } = useNotifications();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    displayName: user.displayName || user.gitname || '',
    username: user.username || '',
    bio: user.bio || '',
    email: user.email || '',
    company: user.company || '',
    location: user.location || '',
    socialLinks: {
      website: user.socialLinks?.website || '',
      twitter: user.socialLinks?.twitter || '',
      github: user.socialLinks?.github || '',
      linkedin: user.socialLinks?.linkedin || '',
    }
  });

  const [avatarUrl, setAvatarUrl] = useState(user.profileImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const field = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear validation error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type & size (max 5MB)
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Image size should be less than 5MB.' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setIsUploading(true);
      const res = await API.post('/user-api/profile/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrl = res.data.profileImageUrl;
      setAvatarUrl(newUrl);
      
      // Update local storage and notify parent
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      onUpdate(res.data.user || { ...user, profileImageUrl: newUrl });
      addToast({ type: 'MENTION', message: 'Profile picture updated successfully!' });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain alphanumeric characters, underscores, and hyphens';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSaving(true);
      const res = await API.put('/user-api/profile', {
        ...formData,
        profileImageUrl: avatarUrl
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      onUpdate(res.data.user);
      addToast({ type: 'MENTION', message: 'Profile updated successfully!' });
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.status === 409) {
        // Handle unique constraint conflicts (username/email in use)
        const msg = err.response.data.message;
        if (msg.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: msg }));
        } else if (msg.toLowerCase().includes('username')) {
          setErrors(prev => ({ ...prev, username: msg }));
        } else {
          addToast({ type: 'error', message: msg });
        }
      } else {
        addToast({ type: 'error', message: err.response?.data?.message || 'Failed to save changes' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0d1117]/90 border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden glassmorphism flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#30363d]">
              <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-[#30363d] bg-[#161b22] flex-shrink-0 cursor-pointer">
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-10">
                    <Loader2 className="w-8 h-8 text-[#2f81f7] animate-spin" />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                  </div>
                )}
                <img
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${formData.username}&background=random&size=200`}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base font-medium text-white mb-1">Profile picture</h3>
                <p className="text-xs text-[#8b949e] mb-3">
                  Upload a new avatar. JPG, PNG, or GIF. Max size 5MB.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSaving}
                  className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-xs font-semibold hover:bg-[#30363d] text-[#c9d1d9] transition-all disabled:opacity-50"
                >
                  Choose File
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Display Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter display name"
                    disabled={isSaving}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                    <span className="text-sm font-semibold select-none">@</span>
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="username"
                    disabled={isSaving}
                    className={`w-full pl-8 pr-3 py-2 bg-[#0d1117] border rounded-lg text-sm text-white placeholder-[#484f58] focus:ring-1 outline-hidden transition-all disabled:opacity-50 ${
                      errors.username 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#30363d] focus:border-[#2f81f7] focus:ring-[#2f81f7]'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    disabled={isSaving}
                    className={`w-full pl-9 pr-3 py-2 bg-[#0d1117] border rounded-lg text-sm text-white placeholder-[#484f58] focus:ring-1 outline-hidden transition-all disabled:opacity-50 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#30363d] focus:border-[#2f81f7] focus:ring-[#2f81f7]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Bio
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3 text-[#8b949e]">
                    <AlignLeft size={16} />
                  </span>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="3"
                    disabled={isSaving}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50 resize-y"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Company
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    disabled={isSaving}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wider">
                  Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    disabled={isSaving}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-[#30363d]">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Social Links</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Website / Portfolio
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                      <Globe size={16} />
                    </span>
                    <input
                      type="url"
                      name="social_website"
                      value={formData.socialLinks.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      disabled={isSaving}
                      className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Twitter / X
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                      <FaTwitter size={16} />
                    </span>
                    <input
                      type="text"
                      name="social_twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleInputChange}
                      placeholder="Username"
                      disabled={isSaving}
                      className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    GitHub Profile
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                      <FaGithub size={16} />
                    </span>
                    <input
                      type="text"
                      name="social_github"
                      value={formData.socialLinks.github}
                      onChange={handleInputChange}
                      placeholder="Username"
                      disabled={isSaving}
                      className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                      <FaLinkedin size={16} />
                    </span>
                    <input
                      type="text"
                      name="social_linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="in/username"
                      disabled={isSaving}
                      className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-[#484f58] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-hidden transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#30363d] bg-[#161b22]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm font-semibold hover:bg-[#30363d] text-[#c9d1d9] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] border border-[#2ea043]/30 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
