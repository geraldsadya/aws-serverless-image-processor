import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Amplify } from "aws-amplify"
import Header from "./components/Header"
import ImageGallery from "./components/ImageGallery"
import ImageUpload from "./components/ImageUpload"
import ImageDetail from "./components/ImageDetail"
import "./App.css"

// Configure Amplify
Amplify.configure({
  API: {
    endpoints: [
      {
        name: "imageProcessorApi",
        endpoint: "https://auevm5zbia.execute-api.eu-north-1.amazonaws.com/prod",
      },
    ],
  },
})

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<ImageGallery />} />
            <Route path="/upload" element={<ImageUpload />} />
            <Route path="/image/:id" element={<ImageDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
