"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, Bot, CheckCircle, Loader2, Send, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TPEvaluationPage() {
    const [soalJawabanList, setSoalJawabanList] = useState([]);
    const [userFullName, setUserFullName] = useState(""); // State untuk menyimpan nama user
    const [praktikumInfo, setPraktikumInfo] = useState({ praktikum_name: "", pertemuan_ke: "" }); // State untuk praktikum dan pertemuan
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [loading, setLoading] = useState(true);
    const [predictionLoading, setPredictionLoading] = useState({});
    const [confirmationLoading, setConfirmationLoading] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false); // Added missing state
    const [manualScores, setManualScores] = useState({});
    const [predictionScores, setPredictionScores] = useState({});
    
    const router = useRouter();
    const params = useParams();
    const { id_attempts } = params; // ID attempts dari URL

    // Function untuk fetch full_name berdasarkan id_attempts
    const handleSubmitScore = async () => {
        setSubmitLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/attempts/${id_attempts}/submit-score`, {
                method: "POST",
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showNotification("Submit skor berhasil!", "success");
                // Optional: Redirect atau reload data jika perlu
            } else {
                showNotification(result.message || "Gagal submit skor", "error");
            }
        } catch (error) {
            showNotification("Terjadi kesalahan saat submit skor", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchUserFullName = async (id_attempts) => {
        try {
        const response = await fetch(`http://localhost:8080/api/attempts/${id_attempts}/user-name`);
        const data = await response.json();
        
        if (data.success && data.data.full_name) {
            setUserFullName(data.data.full_name);
        } else {
            console.error('Error fetching user name:', data.message);
            setUserFullName("Nama tidak ditemukan");
        }
        } catch (error) {
        console.error('Error fetch user name:', error);
        setUserFullName("Nama tidak ditemukan");
        }
    };

    // Function untuk fetch informasi praktikum dan pertemuan
    const fetchPraktikumPertemuan = async (id_attempts) => {
    try {
        const response = await fetch(`http://localhost:8080/api/attempts/${id_attempts}/praktikum-pertemuan`);

        if (!response.ok) {
        console.error('HTTP Error fetching praktikum pertemuan:', response.status, response.statusText);
        setPraktikumInfo({
            praktikum_name: "Praktikum tidak ditemukan",
            pertemuan_ke: "Pertemuan tidak ditemukan"
        });
        return;
        }

        const data = await response.json();
        console.log('Praktikum Pertemuan API Response:', data);

        if (data.success && data.data) {
        setPraktikumInfo({
            praktikum_name: data.data.praktikum_name || "Praktikum tidak ditemukan",
            pertemuan_ke: data.data.pertemuan_ke || "Pertemuan tidak ditemukan"
        });
        } else {
        console.error('Error fetching praktikum pertemuan:', data.message || 'Unknown error');
        setPraktikumInfo({
            praktikum_name: "Praktikum tidak ditemukan",
            pertemuan_ke: "Pertemuan tidak ditemukan"
        });
        }

    } catch (error) {
        console.error('Error fetch praktikum pertemuan:', error);
        setPraktikumInfo({
        praktikum_name: "Praktikum tidak ditemukan",
        pertemuan_ke: "Pertemuan tidak ditemukan"
        });
    }
    };

    // Function untuk fetch predicted score dari database
    const fetchPredictedScore = async (id_attempts_details) => {
        try {
            const response = await fetch(`http://localhost:8080/api/predicted-ml/${id_attempts_details}`);
            
            if (response.ok) {
                const data = await response.json();
                return data.predicted_score;
            } else if (response.status === 404) {
                // Tidak ada predicted score
                return null;
            } else {
                console.error('Error fetching predicted score:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error fetch predicted score:', error);
            return null;
        }
    };

    // Perbaikan untuk useEffect di frontend
    useEffect(() => {
        async function fetchTPAttemptDetails() {
        setLoading(true);
        try {
            // Fetch nama user berdasarkan id_attempts
            await fetchUserFullName(id_attempts);

            // Fetch informasi praktikum dan pertemuan
            await fetchPraktikumPertemuan(id_attempts);

            // Fetch data soal dan jawaban berdasarkan id_attempts
            const response = await fetch(`http://localhost:8080/api/tp-attempts/${id_attempts}`);
            
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('API Response:', data); // Debug log
            
            // Periksa apakah data adalah array dan tidak kosong
            if (Array.isArray(data) && data.length > 0) {
            setSoalJawabanList(data);
            
            // Initialize manual scores dengan skor yang sudah ada
            const initialScores = {};
            const initialPredictions = {};
            
            // Fetch predicted scores untuk setiap item
            for (const item of data) {
                // Set manual score dari re_awarded atau score_awarded
                initialScores[item.id_attempts_details] = item.re_awarded || item.score_awarded || "";
                
                // Fetch predicted score dari API
                const predictedScore = await fetchPredictedScore(item.id_attempts_details);
                if (predictedScore !== null) {
                    initialPredictions[item.id_attempts_details] = predictedScore;
                }
            }
            
            setManualScores(initialScores);
            setPredictionScores(initialPredictions);
            } else if (Array.isArray(data) && data.length === 0) {
            // Data kosong tapi valid
            setSoalJawabanList([]);
            showNotification("Tidak ada data jawaban untuk ditampilkan", "info");
            } else {
            // Response tidak sesuai format yang diharapkan
            console.error('Unexpected data format:', data);
            showNotification("Format data tidak valid", "error");
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification(`Terjadi kesalahan saat mengambil data: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
        }
        
        if (id_attempts) {
        fetchTPAttemptDetails();
        }
    }, [id_attempts]);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleBack = () => {
        router.push("/tugas-pendahuluan/tugas-pendahuluan_asprak"); // Sesuaikan dengan route yang sesuai
    };

    // Updated function untuk handle ML prediction
    const handlePredictScore = async (id_attempts_details) => {
        setPredictionLoading(prev => ({ ...prev, [id_attempts_details]: true }));
        
        try {
            console.log('=== FRONTEND PREDICT DEBUG ===');
            console.log('Predicting for ID:', id_attempts_details);
            
            const response = await fetch("http://localhost:8080/predict-score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_attempts_details }),
            });

            const result = await response.json();
            
            console.log('API Response Status:', response.status);
            console.log('API Response Data:', result);
            
            if (response.ok && result.score !== undefined) {
                console.log('Predicted Score:', result.score);
                
                // Update prediction scores state
                setPredictionScores(prev => ({
                    ...prev,
                    [id_attempts_details]: result.score
                }));
                
                // Auto-fill manual score dengan hasil prediksi
                setManualScores(prev => ({
                    ...prev,
                    [id_attempts_details]: result.score.toString()
                }));
                
                showNotification(`Prediksi skor berhasil: ${result.score}`, "success");
            } else {
                console.error('Prediction failed:', result);
                showNotification(result.error || result.details || "Gagal memprediksi skor", "error");
            }
            console.log('=== END FRONTEND DEBUG ===\n');
        } catch (error) {
            console.error('Frontend prediction error:', error);
            showNotification("Terjadi kesalahan saat memprediksi skor", "error");
        } finally {
            setPredictionLoading(prev => ({ ...prev, [id_attempts_details]: false }));
        }
    };

    const handleConfirmScore = async (id_attempts_details) => {
        const score = parseFloat(manualScores[id_attempts_details]);
        
        if (isNaN(score) || score < 0 || score > 5) {
        showNotification("Skor harus berupa angka antara 0-5", "error");
        return;
        }

        setConfirmationLoading(prev => ({ ...prev, [id_attempts_details]: true }));
        
        try {
        const response = await fetch("http://localhost:8080/api/tp-attempts/confirm-score", {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
            id_attempts_details, 
            score_awarded: score 
            }),
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            // Update local state untuk menunjukkan skor sudah dikonfirmasi
            setSoalJawabanList(prev => 
            prev.map(item => 
                item.id_attempts_details === id_attempts_details 
                ? { ...item, score_awarded: score }
                : item
            )
            );
            
            showNotification("Skor berhasil dikonfirmasi!", "success");
        } else {
            showNotification(result.message || "Gagal mengkonfirmasi skor", "error");
        }
        } catch (error) {
        showNotification("Terjadi kesalahan saat mengkonfirmasi skor", "error");
        } finally {
        setConfirmationLoading(prev => ({ ...prev, [id_attempts_details]: false }));
        }
    };

    const handleManualScoreChange = (id_attempts_details, value) => {
        setManualScores(prev => ({
        ...prev,
        [id_attempts_details]: value
        }));
    };

    // Calculate completion status
    const completedCount = soalJawabanList.filter(item => item.score_awarded).length;
    const totalCount = soalJawabanList.length;
    const isAllCompleted = completedCount === totalCount && totalCount > 0;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Banner */}
        <div className="relative w-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="py-12 md:py-16 flex items-center justify-between">
                <div>
                <h1 className="text-white font-semibold text-2xl md:text-3xl lg:text-4xl tracking-tight">
                    Penilaian Tugas Pendahuluan
                </h1>
                <p className="text-purple-100 mt-2 text-sm md:text-base font-medium">
                    Sistem Penilaian Jawaban Singkat Otomatis
                </p>
                </div>
                <Button 
                onClick={handleBack}
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 flex items-center border border-white/20 shadow-lg"
                variant="ghost"
                >
                <ArrowLeft size={16} className="mr-2" />
                Kembali
                </Button>
            </div>
            </div>
        </div>

        {/* Enhanced Notification */}
        {notification.show && (
            <div className="fixed top-6 right-6 z-50 transition-all duration-300 opacity-100 animate-in slide-in-from-right-4">
            <div className={`${
                notification.type === "success" 
                ? "bg-green-50 border-green-200 text-green-800 shadow-green-100" 
                : notification.type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100"
                : "bg-red-50 border-red-200 text-red-800 shadow-red-100"
            } border-2 p-4 rounded-xl shadow-lg flex items-center w-80 backdrop-blur-sm`}>
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="font-medium">{notification.message}</p>
            </div>
            </div>
        )}

        {/* Content Area */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
            {/* Loading State */}
            {loading && (
            <div className="flex justify-center items-center py-20">
                <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 rounded-full bg-purple-50 opacity-20"></div>
                </div>
            </div>
            )}

            {/* Evaluation Table */}
            {!loading && soalJawabanList.length > 0 ? (
            <div className="space-y-6">
                {/* Main Content Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {praktikumInfo.praktikum_name && praktikumInfo.pertemuan_ke
                            ? `${praktikumInfo.praktikum_name} - Pertemuan ${praktikumInfo.pertemuan_ke}`
                            : "Memuat informasi praktikum..."}
                        </h3>
                        <div className="flex items-center">
                        <User size={16} className="text-purple-600 mr-2" />
                        <p className="text-purple-700 font-medium text-sm">
                            {userFullName ? `Praktikan: ${userFullName}` : "Memuat nama praktikan..."}
                        </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/80 px-4 py-2 rounded-xl border border-purple-200">
                        <p className="text-xs text-gray-600 font-medium">Progress</p>
                        <p className="text-lg font-semibold text-purple-700">{completedCount}/{totalCount}</p>
                        </div>
                    </div>
                    </div>
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                            No
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-96">
                            Pertanyaan & Jawaban Praktikan
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                            Prediksi ML
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                            Konfirmasi Asprak
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                        {soalJawabanList.map((item, index) => (
                        <tr key={item.id_attempts_details} className="hover:bg-white/80 transition-all duration-200">
                            {/* No */}
                            <td className="px-6 py-6 whitespace-nowrap">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 rounded-xl flex items-center justify-center font-semibold text-sm shadow-sm">
                                {index + 1}
                            </div>
                            </td>
                            
                            {/* Pertanyaan & Jawaban */}
                            <td className="px-6 py-6">
                            <div className="space-y-4">
                                <div>
                                <h4 className="font-semibold text-gray-800 mb-3 text-base">Soal {index + 1}</h4>
                                <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-purple-300">
                                    {item.pertanyaan}
                                </p>
                                </div>
                                <div>
                                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Jawaban Praktikan:</p>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-300 shadow-sm">
                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                                    {item.tp_answer}
                                    </p>
                                </div>
                                </div>
                                {/* BUTTON PREDIKSI SKOR */}
                                <div className="pt-2">
                                <Button
                                    onClick={() => handlePredictScore(item.id_attempts_details)}
                                    disabled={predictionLoading[item.id_attempts_details]}
                                    className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200 border border-blue-300 text-xs px-4 py-2 h-9 font-medium shadow-sm transition-all duration-200"
                                    variant="outline"
                                >
                                    {predictionLoading[item.id_attempts_details] ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin mr-2" />
                                        Memprediksi...
                                    </>
                                    ) : (
                                    <>
                                        <Bot size={14} className="mr-2 text-cyan-600" />
                                        Prediksi Skor
                                    </>
                                    )}
                                </Button>
                                </div>
                            </div>
                            </td>
                            
                            {/* KOLOM NILAI HASIL PREDIKSI ML */}
                            <td className="px-6 py-6 text-center">
                            <div className="flex flex-col items-center space-y-2">
                                {predictionScores[item.id_attempts_details] !== undefined ? (
                                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-3 rounded-xl border-2 border-green-200 shadow-sm">
                                    <span className="font-semibold text-xl">
                                    {predictionScores[item.id_attempts_details]} 
                                    </span>
                                </div>
                                ) : (
                                <div className="text-gray-400 text-sm font-medium">
                                    Belum diprediksi
                                </div>
                                )}
                            </div>
                            </td>
                            
                            {/* Konfirmasi Asprak */}
                            <td className="px-6 py-6">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-full max-w-24">
                                <Input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    placeholder="0-5"
                                    className="text-center text-sm h-10 font-medium border-2 rounded-lg focus:ring-2 focus:ring-purple-300"
                                    value={manualScores[item.id_attempts_details] || ""}
                                    onChange={(e) => handleManualScoreChange(item.id_attempts_details, e.target.value)}
                                />
                                </div>
                                <Button
                                onClick={() => handleConfirmScore(item.id_attempts_details)}
                                disabled={confirmationLoading[item.id_attempts_details] || !manualScores[item.id_attempts_details]}
                                className={`w-full text-xs px-3 py-2 h-9 font-medium transition-all duration-200 ${
                                    item.score_awarded 
                                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-2 border-green-300" 
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                                }`}
                                variant={item.score_awarded ? "outline" : "default"}
                                >
                                {confirmationLoading[item.id_attempts_details] ? (
                                    <>
                                    <Loader2 size={12} className="animate-spin mr-1" />
                                    Menyimpan...
                                    </>
                                ) : item.score_awarded ? (
                                    <>
                                    <CheckCircle size={12} className="mr-1" />
                                    Terkonfirmasi
                                    </>
                                ) : (
                                    "Konfirmasi"
                                )}
                                </Button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

                {/* Submit Section - Fixed at bottom */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sticky bottom-6 z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-green-700" />
                        <span className="font-medium text-gray-700">Status Penilaian:</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-lg border border-blue-300">
                        <span className="text-blue-800 font-semibold text-sm">
                            {completedCount} dari {totalCount} soal dinilai
                        </span>
                        </div>
                        
                    </div>
                    </div>
                    
                    <Button
                    onClick={handleSubmitScore}
                    disabled={submitLoading || !isAllCompleted}
                    className={`px-8 py-3 font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isAllCompleted 
                        ? "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 hover:from-purple-600 via-purple-700 to-indigo-800 text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } rounded-xl flex items-center space-x-3`}
                    >
                    {submitLoading ? (
                        <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Memproses Submit...</span>
                        </>
                    ) : (
                        <>
                        <Send size={18} />
                        <span>Submit</span>
                        </>
                    )}
                    </Button>
                </div>
                </div>
            </div>
            ) : !loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 min-h-96 flex items-center justify-center text-gray-400 border border-white/50">
                <div className="text-center">
                <AlertCircle size={64} className="mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium mb-2 text-gray-600">Tidak Ada Data</h3>
                <p className="text-lg text-gray-500">Tidak ada data jawaban untuk dievaluasi</p>
                </div>
            </div>
            ) : null}
        </div>
        </div>
    );
}