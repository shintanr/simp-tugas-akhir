"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Eye, Filter, Loader2, User } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function SubmissionAsprak() {
  const [praktikumList, setPraktikumList] = useState([]);
  const [pertemuanList, setPertemuanList] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [selectedPraktikum, setSelectedPraktikum] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPraktikum();
  }, []);

  useEffect(() => {
    if (selectedPraktikum) {
      fetchPertemuan(selectedPraktikum);
    } else {
      setPertemuanList([]);
      setSelectedPertemuan(null);
    }
  }, [selectedPraktikum]);

  useEffect(() => {
    if (selectedPraktikum) {
      fetchSubmissions();
    }
  }, [selectedPraktikum, selectedPertemuan]);

  const fetchPraktikum = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/praktikum");
      const data = await response.json();
      if (response.ok) {
        setPraktikumList(data.data);
      } else {
        console.error("Failed to fetch praktikum:", data.message);
        showNotification("Gagal mengambil data praktikum", "error");
      }
    } catch (error) {
      console.error("Error fetching praktikum:", error);
      showNotification("Terjadi kesalahan saat mengambil data praktikum", "error");
    }
  };

  const fetchPertemuan = async (praktikumId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pertemuan/${praktikumId}`);
      const data = await response.json();
      if (response.ok) {
        setPertemuanList(data.data);
      } else {
        console.error("Failed to fetch pertemuan:", data.message);
        showNotification("Gagal mengambil data pertemuan", "error");
      }
    } catch (error) {
      console.error("Error fetching pertemuan:", error);
      showNotification("Terjadi kesalahan saat mengambil data pertemuan", "error");
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8080/api/asprak/submissions";
      if (selectedPraktikum && selectedPertemuan) {
        url += `?idPraktikum=${selectedPraktikum}&idPertemuan=${selectedPertemuan}`;
      } else if (selectedPraktikum) {
        url += `?idPraktikum=${selectedPraktikum}`;
      }

      console.log("Fetching submissions from:", url);

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmissions(data.data);
      } else {
        console.error("Failed to fetch submissions:", data.message);
        showNotification("Gagal mengambil data submission", "error");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      showNotification("Terjadi kesalahan saat mengambil data submission", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi navigasi ke detail submission dengan parameter query praktikum dan pertemuan
  const handleViewDetail = (submissionId) => {
    const queryParams = new URLSearchParams();
    if (selectedPraktikum) queryParams.append("praktikum", selectedPraktikum);
    if (selectedPertemuan) queryParams.append("pertemuan", selectedPertemuan);
    
    let detailUrl = `/submission_asprak/detail/${submissionId}`;
    const queryString = queryParams.toString();
    if (queryString) detailUrl += `?${queryString}`;
    
    console.log("Navigating to:", detailUrl);
    router.push(detailUrl);
  };

  const formatJenisLaporan = (jenis) => {
    if (jenis === "fd") return "Form Data (FD)";
    if (jenis === "laporan") return "Laporan Praktikum";
    return jenis;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    let bgColor, textColor;
    switch (status.toLowerCase()) {
      case 'submitted':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'revisi':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'acc':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">ASISTENSI SUBMISSION</h1>
        <p className="text-blue-100 mt-2">Kelola dan nilai submission praktikum mahasiswa</p>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Filter Controls - bagian dropdown */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <Label className="text-gray-700 mb-2 block">Praktikum</Label>
            <Select 
              onValueChange={(value) => {
                setSelectedPraktikum(value);
                console.log("Selected praktikum:", value);
              }} 
              value={selectedPraktikum}
            >
              <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Pilih Praktikum" />
              </SelectTrigger>
              <SelectContent>
                {praktikumList.map((praktikum) => (
                  <SelectItem key={praktikum.id} value={praktikum.id}>
                    {praktikum.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-gray-700 mb-2 block">Pertemuan</Label>
            <Select 
              onValueChange={(value) => {
                setSelectedPertemuan(value);
                console.log("Selected pertemuan:", value);
              }}
              value={selectedPertemuan}
              disabled={!selectedPraktikum}
            >
              <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Pilih Pertemuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pertemuan</SelectItem>
                {pertemuanList.map((pertemuan) => (
                  <SelectItem key={pertemuan.id_pertemuan} value={pertemuan.id_pertemuan}>
                    Pertemuan {pertemuan.pertemuan_ke}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button 
              onClick={fetchSubmissions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 h-10"
            >
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>            
        
        {/* Submission Table */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Memuat data submission...</span>
          </div>
        ) : submissions.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertemuan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={submission.id_submission_praktikan} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.nama_praktikan || 'Mahasiswa'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {submission.nim || 'NIM'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Pertemuan {submission.id_pertemuan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatJenisLaporan(submission.jenis)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        onClick={() => handleViewDetail(submission.id_submission_praktikan)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        size="sm"
                      >
                        <Eye size={16} className="mr-1" /> Lihat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-gray-400 border border-gray-100">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 mb-2">Belum ada submission</p>
            <p className="text-sm text-gray-400">
              {!selectedPraktikum
                ? "Silakan pilih praktikum untuk melihat daftar submission"
                : "Tidak ada submission untuk filter yang dipilih"}
            </p>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300">
          <div className={`${
            notification.type === "success" ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"
          } border-l-4 p-4 rounded-r shadow-md flex items-center w-80`}>
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}