"use client"

import { useState, useEffect } from "react"
import { API } from "aws-amplify"
import { Link } from "react-router-dom"
import "./ImageGallery.css"

const ImageGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await API.get("imageProcessorApi", "/images", {})
      setImages(response.images || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Failed to load images. Please try again later.")
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading images...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="gallery-container">
      <h1>Image Gallery</h1>

      {images.length === 0 ? (
        <div className="no-images">
          <p>No images found. Upload some images to get started!</p>
          <Link to="/upload" className="btn">
            Upload Images
          </Link>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <Link to={`/image/${image.id}`}>
                <img
                  src={image.processedImageUrl || "/placeholder.svg"}
                  alt={image.originalFilename || "Processed image"}
                  className="gallery-image"
                />
                <div className="image-info">
                  <h3>{image.originalFilename || "Image"}</h3>
                  <p>Processed on: {new Date(image.processedAt).toLocaleDateString()}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="gallery-actions">
        <Link to="/upload" className="btn">
          Upload New Image
        </Link>
      </div>
    </div>
  )
}

export default ImageGallery
