import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link

// Import the new FileUploadComponent
import FileUploadComponent from "../../components/FileUploadComponent"; // Adjust path as necessary
import SuccessModal from "/src/components/SuccessModal";

// --- SVG Icons ---
const FileTextIcon = () => (
  <svg
    className="w-8 h-8 mr-3 text-blue-600 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    ></path>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    ></path>
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500 hover:text-gray-800 transition-colors"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </svg>
);

const ResetIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h5M20 20v-5h-5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 9a9 9 0 0114.13-6.36M20 15a9 9 0 01-14.13 6.36"
    />
  </svg>
);

const UploadActionIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    ></path>
  </svg>
);

// --- Layout Components (assuming these are in Layout directory) ---
import Navbar from "/src/Layout/Navbar";
import Footer from "/src/Layout/Footer";
import indiaBackground from "/src/assets/in.svg"; // Assuming this path is correct

// --- Background India Map SVG ---
const IndiaMapBackground = () => (
  <div
    className="hero-background absolute inset-0 z-0 opacity-20"
    aria-hidden="true"
  >
    <img
      src={indiaBackground}
      alt=""
      loading="lazy"
      className="w-full h-full object-cover object-center"
    />
  </div>
);
// --- Background India Map SVG ---
const IndiaMapBackgroundBottom = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <img
      src={indiaBackground}
      alt=""
      loading="lazy"
      className="absolute top-1 left-1/2 -translate-x-8 translate-y-50 w-full max-w-4xl h-auto opacity-20 mt-12"
    />
  </div>
);

// --- Main Application Form Component ---
export default function InterCasteMarriageForm() {
  const [formData, setFormData] = useState({
    marriageCertNumber: "",
    partnerOneCasteCert: null,
    partnerTwoCasteCert: null,
    marriageCertPdf: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // To store file objects that have been selected, for display purposes
  const [selectedFiles, setSelectedFiles] = useState({
    partnerOneCasteCert: null,
    partnerTwoCasteCert: null,
    marriageCertPdf: null,
  });

  const handleFileSelect = (file, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const removeSelectedFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  const isFormValid =
    formData.marriageCertNumber.trim() !== "" &&
    formData.partnerOneCasteCert &&
    formData.partnerTwoCasteCert &&
    formData.marriageCertPdf;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill all fields and upload all required documents.");
      return;
    }
    // console.log("Form Data Submitted:", formData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      marriageCertNumber: "",
      partnerOneCasteCert: null,
      partnerTwoCasteCert: null,
      marriageCertPdf: null,
    });
    setSelectedFiles({
      partnerOneCasteCert: null,
      partnerTwoCasteCert: null,
      marriageCertPdf: null,
    });
  };

  return (
    <>
      <style>{`
                body {
                    background-color: #F8F9FA; /* Default background */
                    font-family: 'Inter', sans-serif;
                }
                .hero-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 0;
                }
                .hero-background__image {
                    filter: grayscale(80%) brightness(120%) contrast(80%);
                    opacity: 0.15; /* Soften the background image */
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-radius: 1rem 0 1rem 0;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
                }
                .form-input {
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    transition: all 0.2s ease-in-out;
                }
                .form-input:focus {
                    border-color: #00539C;
                    box-shadow: 0 0 0 3px rgba(0, 83, 156, 0.15);
                    background: rgba(255, 255, 255, 0.9);
                }
            `}</style>
      <Navbar />
      <div
        className="min-h-screen w-full flex flex-col pt-16"
        style={{
          backgroundColor: "#F8F9FA",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <IndiaMapBackground />
          <IndiaMapBackgroundBottom />

          <div className="relative z-10 max-w-4xl mx-auto py-8">
            <div className="text-center mb-10">
              <h1
                className="text-4xl font-bold tracking-tight"
                style={{ color: "#343A40" }}
              >
                Inter-Caste Marriage Incentive Application
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Please provide the following details and documents to proceed.
              </p>
            </div>

            <div className="p-6 sm:p-8 glass-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="marriage-cert-num"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Marriage Certificate Number
                  </label>
                  <input
                    type="text"
                    id="marriage-cert-num"
                    className="block w-full px-4 py-3 form-input rounded-lg shadow-sm placeholder-gray-500 focus:outline-none sm:text-base"
                    placeholder="Enter your certificate number"
                    value={formData.marriageCertNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marriageCertNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
                  <div className="w-full sm:w-1/2">
                    {/* Partner 1 Caste Certificate Upload */}
                    {selectedFiles.partnerOneCasteCert ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Caste Certificate (Partner 1)
                        </label>
                        <div className="flex items-center justify-between w-full p-3 bg-white/80 rounded-lg shadow-sm">
                          <div className="flex items-center truncate">
                            <FileTextIcon />
                            <div className="truncate">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {selectedFiles.partnerOneCasteCert.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  selectedFiles.partnerOneCasteCert.size / 1024
                                ).toFixed(1)}{" "}
                                KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedFile("partnerOneCasteCert")
                            }
                            className="p-1"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <FileUploadComponent
                        label="Caste Certificate (Partner 1)"
                        onFileSelect={(file) =>
                          handleFileSelect(file, "partnerOneCasteCert")
                        }
                      />
                    )}
                  </div>
                  <div className="w-full sm:w-1/2">
                    {/* Partner 2 Caste Certificate Upload */}
                    {selectedFiles.partnerTwoCasteCert ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Caste Certificate (Partner 2)
                        </label>
                        <div className="flex items-center justify-between w-full p-3 bg-white/80 rounded-lg shadow-sm">
                          <div className="flex items-center truncate">
                            <FileTextIcon />
                            <div className="truncate">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {selectedFiles.partnerTwoCasteCert.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  selectedFiles.partnerTwoCasteCert.size / 1024
                                ).toFixed(1)}{" "}
                                KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedFile("partnerTwoCasteCert")
                            }
                            className="p-1"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <FileUploadComponent
                        label="Caste Certificate (Partner 2)"
                        onFileSelect={(file) =>
                          handleFileSelect(file, "partnerTwoCasteCert")
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Marriage Certificate PDF Upload */}
                {selectedFiles.marriageCertPdf ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Marriage Certificate (PDF)
                    </label>
                    <div className="flex items-center justify-between w-full p-3 bg-white/80 rounded-lg shadow-sm">
                      <div className="flex items-center truncate">
                        <FileTextIcon />
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {selectedFiles.marriageCertPdf.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              selectedFiles.marriageCertPdf.size / 1024
                            ).toFixed(1)}{" "}
                            KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile("marriageCertPdf")}
                        className="p-1"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>
                ) : (
                  <FileUploadComponent
                    label="Marriage Certificate (PDF)"
                    onFileSelect={(file) =>
                      handleFileSelect(file, "marriageCertPdf")
                    }
                  />
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                  >
                    <ArrowLeftIcon />
                    Back to Dashboard
                  </Link>
                  <div className="flex w-full sm:w-auto space-x-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <ResetIcon />
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors ${
                        isFormValid
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      style={
                        isFormValid
                          ? { boxShadow: "0 4px 14px 0 rgb(79 70 229 / 39%)" }
                          : {}
                      }
                    >
                      <UploadActionIcon />
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <SuccessModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
