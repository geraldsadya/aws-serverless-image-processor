"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { API } from "aws-amplify"
import "./ImageDetail.css"

const ImageDetail = () => {
  const { id } = useParams()
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchImageDetails()
  }, [id])

  const fetchImageDetails = async () => {
    try {
      setLoading(true)
      // Get all images and find the one with matching ID
      // In a real app, you'd have a dedicated endpoint for getting a single image
      const response = await API.get("imageProcessorApi", "/images", {})
      const foundImage = response.images.find((img) => img.id === id)

      if (foundImage) {
        setImage(foundImage)
      } else {
        setError("Image not found")
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching image details:", err)
      setError("Failed to load image details")
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading image details...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn">
          Back to Gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="image-detail-container">
      <div className="image-detail-card card">
        <div className="image-detail-header">
          <h1>{image.originalFilename || "Image Details"}</h1>
          <Link to="/" className="btn btn-secondary">
            Back to Gallery
          </Link>
        </div>

        <div className="image-comparison">
          <div className="image-original">
            <h3>Original Image</h3>
            <img src={image.originalImageUrl || "/placeholder.svg"} alt="Original" className="detail-image" />
          </div>

          <div className="image-processed">
            <h3>Processed Image</h3>
            <img src={image.processedImageUrl || "/placeholder.svg"} alt="Processed" className="detail-image" />
          </div>
        </div>

        <div className="image-metadata">
          <h3>Image Metadata</h3>
          <table className="metadata-table">
            <tbody>
              <tr>
                <td>Original Filename</td>
                <td>{image.originalFilename || "N/A"}</td>
              </tr>
              <tr>
                <td>Uploaded At</td>
                <td>{new Date(image.uploadedAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Processed At</td>
                <td>{new Date(image.processedAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Original Size</td>
                <td>{image.originalSize ? `${Math.round(image.originalSize / 1024)} KB` : "N/A"}</td>
              </tr>
              <tr>
                <td>Processed Size</td>
                <td>{image.processedSize ? `${Math.round(image.processedSize / 1024)} KB` : "N/A"}</td>
              </tr>
              <tr>
                <td>Dimensions</td>
                <td>{image.width && image.height ? `${image.width} × ${image.height}` : "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ImageDetail
