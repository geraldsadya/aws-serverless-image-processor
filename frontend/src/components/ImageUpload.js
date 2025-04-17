"use client"

import { useState } from "react"
import { API } from "aws-amplify"
import { useNavigate } from "react-router-dom"
import "./ImageUpload.css"

const ImageUpload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Step 1: Get pre-signed URL
      const response = await API.post("imageProcessorApi", "/upload", {
        body: {
          fileType: file.type,
        },
      })

      // Step 2: Upload to S3 using pre-signed URL
      await fetch(response.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      // Success - redirect to gallery
      setUploading(false)
      navigate("/")
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to upload image. Please try again.")
      setUploading(false)
    }
  }

  return (
    <div className="upload-container card">
      <h1>Upload Image</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image-upload">Select Image</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
            disabled={uploading}
          />
        </div>

        {preview && (
          <div className="image-preview">
            <h3>Preview</h3>
            <img src={preview || "/placeholder.svg"} alt="Preview" />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn" disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ImageUpload
