"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { 
  AlertCircle, 
  Calendar, 
  CheckSquare, 
  Eye, 
  FilePlus, 
  FileDown, 
  Trash2, 
  Upload, 
  UploadCloud,
  FileText,
  Clock 
} from "lucide-react";

// API endpoints configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const API_ENDPOINTS = {
  PRAKTIKUM: `${API_BASE_URL}/praktikum`,
  PERTEMUAN: (id) => `${API_BASE_URL}/pertemuan/${id}`,
  SUBMISSION: `${API_BASE_URL}/submission`,
  SUBMISSION_BY_PRAKTIKUM: (id) => `${API_BASE_URL}/submission?idPraktikum=${id}`,
  SUBMISSION_UPLOAD: `${API_BASE_URL}/submission/upload`,
  SUBMISSION_DELETE: (id) => `${API_BASE_URL}/submission/${id}`,
  SUBMISSION_DOWNLOAD: (id) => `${API_BASE_URL}/submission/download/${id}`
};

// File types configuration
const FILE_TYPES = {
  FD: "fd",
  LAPORAN: "laporan"
};

// Status types with their UI configurations
const STATUS_TYPES = {
  SUBMITTED: {
    key: "submitted",
    label: "Submitted",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  },
  REVISI: {
    key: "revisi",
    label: "Revisi",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800"
  },
  ACC: {
    key: "acc",
    label: "ACC",
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  }
};

export default function SubmissionPage() {
  // State management
  const [dialogState, setDialogState] = useState({
    submissionOpen: false,
    catatanOpen: false
  });
  const [formData, setFormData] = useState({
    jenisPraktikum: "",
    pertemuan: "",
    jenisFile: "",
    file: null
  });
  const [dataState, setDataState] = useState({
    praktikumList: [],
    pertemuanList: [],
    submissionData: [],
    currentCatatan: "",
    selectedPraktikum: "",
    selectedPraktikumName: ""
  });
  const [uiState, setUiState] = useState({
    uploading: false,
    notification: { show: false, message: "", type: "" }
  });
  
  const router = useRouter();

  // Fetch praktikum data on component mount
  useEffect(() => {
    fetchPraktikumData();
  }, []);

  // Fetch pertemuan data when jenisPraktikum changes
  useEffect(() => {
    if (formData.jenisPraktikum) {
      fetchPertemuanData(formData.jenisPraktikum);
    }
  }, [formData.jenisPraktikum]);

  // Fetch submission data when selectedPraktikum changes
  useEffect(() => {
    if (dataState.selectedPraktikum) {
      fetchSubmissionData(dataState.selectedPraktikum);
    }
  }, [dataState.selectedPraktikum]);

  // Dropzone configuration for file uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB max file size
    onDrop: (acceptedFiles) => {
      handleFormChange('file', acceptedFiles[0]);
    },
  });

  // API functions
  const fetchPraktikumData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRAKTIKUM);
      const data = await response.json();
      
      if (response.ok) {
        setDataState(prev => ({ ...prev, praktikumList: data.data }));
      } else {
        showNotification("Gagal mengambil data praktikum", "error");
        console.error("Failed to fetch praktikum:", data.message);
      }
    } catch (error) {
      showNotification("Terjadi kesalahan jaringan", "error");
      console.error("Error fetching praktikum:", error);
    }
  };

  const fetchPertemuanData = async (praktikumId) => {
    try {
      const response = await fetch(API_ENDPOINTS.PERTEMUAN(praktikumId));
      const data = await response.json();
      
      if (response.ok) {
        setDataState(prev => ({ ...prev, pertemuanList: data.data }));
      } else {
        showNotification("Gagal mengambil data pertemuan", "error");
        console.error("Failed to fetch pertemuan:", data.message);
      }
    } catch (error) {
      showNotification("Terjadi kesalahan jaringan", "error");
      console.error("Error fetching pertemuan:", error);
    }
  };

  const fetchSubmissionData = async (praktikumId) => {
    try {
      const response = await fetch(API_ENDPOINTS.SUBMISSION_BY_PRAKTIKUM(praktikumId));
      const data = await response.json();
      
      if (response.ok) {
        setDataState(prev => ({ ...prev, submissionData: data.data }));
      } else {
        showNotification("Gagal mengambil data submission", "error");
        console.error("Failed to fetch submission data:", data.message);
      }
    } catch (error) {
      showNotification("Terjadi kesalahan jaringan", "error");
      console.error("Error fetching submission data:", error);
    }
  };

  // UI event handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePraktikumChange = (value) => {
    const praktikum = dataState.praktikumList.find(p => p.id === value);
    setDataState(prev => ({ 
      ...prev, 
      selectedPraktikum: value,
      selectedPraktikumName: praktikum ? praktikum.name : ""
    }));
  };

  const showNotification = (message, type) => {
    setUiState(prev => ({
      ...prev,
      notification: { show: true, message, type }
    }));
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setUiState(prev => ({
        ...prev,
        notification: { show: false, message: "", type: "" }
      }));
    }, 3000);
  };

  const toggleDialog = (dialogName, isOpen) => {
    setDialogState(prev => ({ ...prev, [dialogName]: isOpen }));
  };

  // Submission operations
  const handleSubmit = async () => {
    // Validate form data
    if (!formData.jenisPraktikum || !formData.pertemuan || !formData.jenisFile) {
      showNotification("Silakan isi semua kolom yang diperlukan", "error");
      return;
    }

    if (!formData.file) {
      showNotification("Silakan pilih file untuk diupload", "error");
      return;
    }

    setUiState(prev => ({ ...prev, uploading: true }));

    // Prepare form data for submission
    const submitFormData = new FormData();
    submitFormData.append("file", formData.file);
    submitFormData.append("idPraktikum", formData.jenisPraktikum);
    submitFormData.append("idPertemuan", formData.pertemuan);
    submitFormData.append("jenis", formData.jenisFile);
    submitFormData.append("idUser", "1"); // TODO: Get from authentication system

    try {
      const response = await fetch(API_ENDPOINTS.SUBMISSION_UPLOAD, {
        method: "POST",
        body: submitFormData,
      });

      if (response.ok) {
        showNotification("Submission berhasil diunggah!", "success");
        toggleDialog('submissionOpen', false);
        
        // Reset form
        setFormData({
          jenisPraktikum: "",
          pertemuan: "",
          jenisFile: "",
          file: null
        });
        
        // Refresh submission data if we're on the same praktikum view
        if (dataState.selectedPraktikum === formData.jenisPraktikum) {
          fetchSubmissionData(dataState.selectedPraktikum);
        }
      } else {
        showNotification("Gagal submit. Silakan coba lagi.", "error");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      setUiState(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleViewFile = (item) => {
    if (!item || !item.id_submission_praktikan) {
      console.error('ID submission tidak ditemukan', item);
      showNotification("Tidak dapat melihat file, ID submission tidak ditemukan", "error");
      return;
    }

    // Navigate to preview page
    router.push(`/submission_praktikan/preview/${item.id_submission_praktikan}`);
  };

  const handleViewCatatan = (catatan) => {
    setDataState(prev => ({ ...prev, currentCatatan: catatan || "Tidak ada catatan asistensi" }));
    toggleDialog('catatanOpen', true);
  };

  const handleDownloadRevisi = (filePath, submissionId) => {
    if (!filePath) {
      showNotification("File revisi tidak tersedia", "error");
      return;
    }

    // Open download endpoint in new tab
    window.open(API_ENDPOINTS.SUBMISSION_DOWNLOAD(submissionId), '_blank');
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus submission ini?')) {
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.SUBMISSION_DELETE(submissionId), {
        method: "DELETE",
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.log("Response bukan format JSON:", await response.text());
      }

      if (response.ok) {
        showNotification("Submission berhasil dihapus!", "success");
        fetchSubmissionData(dataState.selectedPraktikum);
      } else {
        const errorMessage = responseData?.message || "Gagal menghapus submission. Silakan coba lagi.";
        console.error("Server error:", errorMessage);
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      showNotification("Terjadi kesalahan pada jaringan. Silakan coba lagi.", "error");
    }
  };

  // UI Helper functions
  const getStatusBadge = (status) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();
    const statusConfig = Object.values(STATUS_TYPES).find(s => s.key === statusLower) || {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} w-20 justify-center`}>
        {status}
      </span>
    );
  };

  const formatJenisLaporan = (jenis) => {
    if (jenis === FILE_TYPES.FD) return "Form Data (FD)";
    if (jenis === FILE_TYPES.LAPORAN) return "Laporan Praktikum";
    return jenis;
  };

  const fileTypeIcon = (jenis) => {
    if (jenis === FILE_TYPES.FD) return <FileText size={16} className="mr-1" />;
    if (jenis === FILE_TYPES.LAPORAN) return <FileText size={16} className="mr-1" />;
    return <FileText size={16} className="mr-1" />;
  };

  return (
    <>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">SUBMISSION</h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Title and Add Button + Praktikum Selection */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Praktikum Selection */}
          <div>
            <Label className="text-gray-700 mb-2 block">Pilih Praktikum</Label>
            <Select onValueChange={handlePraktikumChange} value={dataState.selectedPraktikum}>
              <SelectTrigger className="w-64 border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Pilih Praktikum" />
              </SelectTrigger>
              <SelectContent>
                {dataState.praktikumList.map((praktikum) => (
                  <SelectItem key={praktikum.id} value={praktikum.id}>
                    {praktikum.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            className="bg-[#FFE156] hover:bg-[#FFD700] text-gray-800 px-5 py-2 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={() => toggleDialog('submissionOpen', true)}
          >
            <Upload className="mr-2 h-5 w-5" /> Tambah Submission
          </Button>
        </div>

        {/* Praktikum Title Display */}
        {dataState.selectedPraktikumName && (
          <div className="flex items-center mb-4">
            <Calendar className="text-blue-600 mr-2" size={20} />
            <h3 className="text-xl font-semibold text-gray-700">{dataState.selectedPraktikumName}</h3>
          </div>
        )}

        {/* Submission Table */}
        {dataState.selectedPraktikum ? (
          dataState.submissionData.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertemuan ke</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Laporan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">File Revisi</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan Asistensi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataState.submissionData.map((item, index) => (
                    <tr 
                      key={item.id_submission_praktikan} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Pertemuan {item.id_pertemuan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {fileTypeIcon(item.jenis)} 
                          {formatJenisLaporan(item.jenis)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewFile(item)}
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            title="Lihat"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSubmission(item.id_submission_praktikan)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {item.file_revisi_asprak ? (
                          <button 
                            onClick={() => handleDownloadRevisi(item.file_revisi_asprak, item.id_submission_praktikan)}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center mx-auto"
                            title="Download Revisi"
                          >
                            <FileDown size={16} />
                          </button>
                        ) : (
                          <span className="text-gray-400">Tidak ada file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {item.catatan_asistensi ? (
                          <Button
                            onClick={() => handleViewCatatan(item.catatan_asistensi)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            size="sm"
                          >
                            <Eye size={16} className="mr-1" /> Lihat
                          </Button>
                        ) : (
                          <span className="text-gray-400">Tidak ada catatan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-gray-400 border border-gray-100">
              <Clock size={48} className="text-gray-300 mb-4" />
              <p className="text-lg">Belum ada submission yang diunggah untuk praktikum ini</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-gray-400 border border-gray-100">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <p className="text-lg">Silakan pilih praktikum untuk melihat daftar submission</p>
          </div>
        )}
      </div>

      {/* Dialog for Adding Submission */}
      <Dialog open={dialogState.submissionOpen} onOpenChange={(isOpen) => toggleDialog('submissionOpen', isOpen)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Tambah Submission Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-gray-700 mb-1 block">Jenis Praktikum</Label>
              <Select 
                onValueChange={(value) => handleFormChange('jenisPraktikum', value)} 
                value={formData.jenisPraktikum}
              >
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Pilih Praktikum" />
                </SelectTrigger>
                <SelectContent>
                  {dataState.praktikumList.map((praktikum) => (
                    <SelectItem key={praktikum.id} value={praktikum.id}>
                      {praktikum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 mb-1 block">Pertemuan</Label>
              <Select 
                onValueChange={(value) => handleFormChange('pertemuan', value)} 
                value={formData.pertemuan} 
                disabled={!formData.jenisPraktikum}
              >
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder={!formData.jenisPraktikum ? "Pilih praktikum terlebih dahulu" : "Pilih Pertemuan"} />
                </SelectTrigger>
                <SelectContent>
                  {dataState.pertemuanList.map((item) => (
                    <SelectItem key={item.id_pertemuan} value={item.id_pertemuan}>
                      {`Pertemuan ${item.pertemuan_ke}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 mb-1 block">Jenis File</Label>
              <Select onValueChange={(value) => handleFormChange('jenisFile', value)} value={formData.jenisFile}>
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Pilih Jenis File" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fd">Form Data (FD)</SelectItem>
                  <SelectItem value="laporan">Laporan Praktikum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 mb-1 block">Upload File</Label>
              <div 
                {...getRootProps()} 
                className={`border-2 ${isDragActive ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300"} 
                  rounded-lg p-8 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50`}
              >
                <input {...getInputProps()} />
                {formData.file ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 rounded-full p-3 mb-2">
                      <FilePlus className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-green-600 font-medium mb-1">{formData.file.name}</p>
                    <p className="text-gray-500 text-sm">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-full p-3 mb-2">
                      <UploadCloud className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">Drag & drop file di sini</p>
                    <p className="text-gray-500 text-sm">Atau klik untuk memilih file</p>
                    <p className="text-gray-400 text-xs mt-2">PDF atau Docx (Maks. 10MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => toggleDialog('submissionOpen', false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={uiState.uploading || !formData.file} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uiState.uploading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Mengunggah...
                </>
              ) : (
                "Kirim Submission"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal untuk menampilkan catatan asistensi */}
      <Dialog open={dialogState.catatanOpen} onOpenChange={(isOpen) => toggleDialog('catatanOpen', isOpen)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Catatan Asistensi</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{dataState.currentCatatan}</p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => toggleDialog('catatanOpen', false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {uiState.notification.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
          uiState.notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white transition-all duration-300 z-50`}>
          {uiState.notification.type === "success" ? (
            <CheckSquare className="mr-2 h-5 w-5" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5" />
          )}
          <p>{uiState.notification.message}</p>
        </div>
      )}
    </>
  );
}