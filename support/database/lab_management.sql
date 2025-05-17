/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `description` text,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'open, closed',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `kelompok`;
CREATE TABLE `kelompok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kelompok` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `kelompok_praktikum`;
CREATE TABLE `kelompok_praktikum` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `id_praktikum` int DEFAULT NULL,
  `id_kelompok` int DEFAULT NULL,
  `id_shift` int DEFAULT NULL,
  `is_asisten` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`),
  KEY `id_praktikum` (`id_praktikum`),
  KEY `id_kelompok` (`id_kelompok`),
  KEY `id_shift` (`id_shift`),
  CONSTRAINT `kelompok_praktikum_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  CONSTRAINT `kelompok_praktikum_ibfk_2` FOREIGN KEY (`id_praktikum`) REFERENCES `praktikum` (`id_praktikum`),
  CONSTRAINT `kelompok_praktikum_ibfk_3` FOREIGN KEY (`id_kelompok`) REFERENCES `kelompok` (`id`),
  CONSTRAINT `kelompok_praktikum_ibfk_4` FOREIGN KEY (`id_shift`) REFERENCES `shift` (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `labs`;
CREATE TABLE `labs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `max_praktikan` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `modul_eldas`;
CREATE TABLE `modul_eldas` (
  `id_modul` int NOT NULL AUTO_INCREMENT,
  `id_praktikum` int DEFAULT NULL,
  `judul_modul` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_general_ci,
  `file_modul` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_modul`),
  KEY `id_praktikum` (`id_praktikum`),
  CONSTRAINT `modul_eldas_ibfk_1` FOREIGN KEY (`id_praktikum`) REFERENCES `praktikum` (`id_praktikum`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `penilaian`;
CREATE TABLE `penilaian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `id_kelompok` int DEFAULT NULL,
  `id_praktikum` int DEFAULT NULL,
  `id_modul` int DEFAULT NULL,
  `id_shift` int DEFAULT NULL,
  `nilai_tp` float DEFAULT NULL,
  `nilai_praktikum` float DEFAULT NULL,
  `nilai_fd` float DEFAULT NULL,
  `nilai_laporan_tugas` float DEFAULT NULL,
  `nilai_responsi` float DEFAULT NULL,
  `nilai_total` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`),
  KEY `id_kelompok` (`id_kelompok`),
  KEY `id_modul` (`id_modul`),
  KEY `id_shift` (`id_shift`),
  KEY `id_praktikum` (`id_praktikum`),
  CONSTRAINT `penilaian_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  CONSTRAINT `penilaian_ibfk_3` FOREIGN KEY (`id_modul`) REFERENCES `modul_eldas` (`id_modul`),
  CONSTRAINT `penilaian_ibfk_4` FOREIGN KEY (`id_shift`) REFERENCES `shift` (`id_shift`),
  CONSTRAINT `penilaian_ibfk_5` FOREIGN KEY (`id_kelompok`) REFERENCES `kelompok` (`id`),
  CONSTRAINT `penilaian_ibfk_6` FOREIGN KEY (`id_praktikum`) REFERENCES `praktikum` (`id_praktikum`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `praktikum`;
CREATE TABLE `praktikum` (
  `id_praktikum` int NOT NULL AUTO_INCREMENT,
  `lab_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `modul` text COLLATE utf8mb4_general_ci,
  `code` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_praktikum`),
  KEY `lab_id` (`lab_id`),
  CONSTRAINT `praktikum_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `presensi`;
CREATE TABLE `presensi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `id_praktikum` int DEFAULT NULL,
  `id_modul` int DEFAULT NULL,
  `id_shift` int DEFAULT NULL,
  `status` enum('Belum Hadir','Hadir','Izin','Sakit','Alpa') COLLATE utf8mb4_general_ci NOT NULL,
  `waktu_presensi` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`),
  KEY `id_praktikum` (`id_praktikum`),
  KEY `id_modul` (`id_modul`),
  KEY `id_shift` (`id_shift`),
  CONSTRAINT `presensi_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  CONSTRAINT `presensi_ibfk_2` FOREIGN KEY (`id_praktikum`) REFERENCES `praktikum` (`id_praktikum`),
  CONSTRAINT `presensi_ibfk_3` FOREIGN KEY (`id_modul`) REFERENCES `modul_eldas` (`id_modul`),
  CONSTRAINT `presensi_ibfk_4` FOREIGN KEY (`id_shift`) REFERENCES `shift` (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `shift`;
CREATE TABLE `shift` (
  `id_shift` int NOT NULL AUTO_INCREMENT,
  `nama_shift` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `deskripsi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nim` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','praktikan','asisten') COLLATE utf8mb4_general_ci NOT NULL,
  `angkatan` year NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nim` (`nim`),
  KEY `fk_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `complaints` (`id`, `reference_type`, `reference_id`, `description`, `status`) VALUES
(1, 'presensi', 1, 'saya hadir tapi keterangan belum hadir', 'open');
INSERT INTO `complaints` (`id`, `reference_type`, `reference_id`, `description`, `status`) VALUES
(2, 'presensi', 8, 'komplain masuk', 'closed');
INSERT INTO `complaints` (`id`, `reference_type`, `reference_id`, `description`, `status`) VALUES
(5, 'penilaian', 8, 'saya belajar kok nilainya jelek', 'closed');
INSERT INTO `complaints` (`id`, `reference_type`, `reference_id`, `description`, `status`) VALUES
(6, 'presensi', 12, 'aku masuk', 'closed'),
(7, 'presensi', 11, 'akulo melbu', 'closed');

INSERT INTO `kelompok` (`id`, `nama_kelompok`) VALUES
(1, 'Kelompok 1');
INSERT INTO `kelompok` (`id`, `nama_kelompok`) VALUES
(2, 'Kelompok 2');
INSERT INTO `kelompok` (`id`, `nama_kelompok`) VALUES
(3, 'Kelompok 3');
INSERT INTO `kelompok` (`id`, `nama_kelompok`) VALUES
(4, 'Kelompok 4'),
(5, 'Kelompok 5'),
(6, 'Kelompok 6'),
(7, 'Kelompok 7'),
(8, 'Kelompok 8'),
(9, 'Kelompok 9'),
(10, 'Kelompok 10'),
(11, 'Kelompok 11'),
(12, 'Kelompok 12'),
(13, 'Kelompok 13'),
(14, 'Kelompok 14'),
(15, 'Kelompok 15'),
(16, 'Kelompok 16');

INSERT INTO `kelompok_praktikum` (`id`, `id_user`, `id_praktikum`, `id_kelompok`, `id_shift`, `is_asisten`) VALUES
(3, 3, 1, 2, 1, 0);
INSERT INTO `kelompok_praktikum` (`id`, `id_user`, `id_praktikum`, `id_kelompok`, `id_shift`, `is_asisten`) VALUES
(6, 8, 17, 7, 1, 0);
INSERT INTO `kelompok_praktikum` (`id`, `id_user`, `id_praktikum`, `id_kelompok`, `id_shift`, `is_asisten`) VALUES
(10, 4, 17, 9, 1, 1);
INSERT INTO `kelompok_praktikum` (`id`, `id_user`, `id_praktikum`, `id_kelompok`, `id_shift`, `is_asisten`) VALUES
(11, 3, 17, 7, 1, 0),
(12, 17, 18, 2, 1, 0),
(13, 4, 18, 6, 1, 1),
(14, 3, 18, 1, 1, 0),
(15, 3, 16, 7, 1, 1),
(16, 17, 16, 7, 1, 0),
(17, 16, 18, 1, 1, 0);

INSERT INTO `labs` (`id`, `name`, `description`, `max_praktikan`) VALUES
(1, 'Lab RPL', 'Lab untuk praktikum Rekayasa Perangkat Lunak', 35);
INSERT INTO `labs` (`id`, `name`, `description`, `max_praktikan`) VALUES
(2, 'Lab Mulmed', 'Lab untuk praktikum Multimedia', 40);
INSERT INTO `labs` (`id`, `name`, `description`, `max_praktikan`) VALUES
(3, 'Lab Jaringan', 'Lab untuk praktikum Jaringan Komputer', 36);
INSERT INTO `labs` (`id`, `name`, `description`, `max_praktikan`) VALUES
(4, 'Lab Sister', 'Lab untuk praktikum Sistem Tertanam', 9);

INSERT INTO `modul_eldas` (`id_modul`, `id_praktikum`, `judul_modul`, `deskripsi`, `file_modul`) VALUES
(1, 1, 'Pengantar Elektronika', 'Modul ini membahas dasar-dasar elektronika.', 'modul_pengantar.pdf');
INSERT INTO `modul_eldas` (`id_modul`, `id_praktikum`, `judul_modul`, `deskripsi`, `file_modul`) VALUES
(2, 1, 'Komponen Elektronika', 'Modul ini menjelaskan berbagai komponen elektronik seperti resistor, kapasitor, dan transistor.', 'modul_komponen.pdf');
INSERT INTO `modul_eldas` (`id_modul`, `id_praktikum`, `judul_modul`, `deskripsi`, `file_modul`) VALUES
(3, 1, 'Rangkaian Seri dan Paralel', 'Modul ini mengajarkan tentang rangkaian seri dan paralel serta cara perhitungannya.', 'modul_rangkaian.pdf');
INSERT INTO `modul_eldas` (`id_modul`, `id_praktikum`, `judul_modul`, `deskripsi`, `file_modul`) VALUES
(4, 1, 'Pengukuran dengan Multimeter', 'Modul ini membahas cara menggunakan multimeter untuk mengukur tegangan, arus, dan resistansi.', 'modul_multimeter.pdf'),
(5, 1, 'Rangkaian Logika Dasar', 'Modul ini membahas gerbang logika dasar seperti AND, OR, dan NOT.', 'modul_logika.pdf'),
(6, 16, 'Pengantar Elektronika', 'Modul ini membahas dasar-dasar elektronika.', 'modul_pengantar.pdf'),
(7, 16, 'Komponen Elektronika', 'Modul ini menjelaskan berbagai komponen elektronik.', 'modul_komponen.pdf'),
(13, 17, 'Temporibus incididun', 'Lorem doloribus fugi', 'Doloremque laborum s'),
(14, 17, 'tamu', 'asdasdas', 'lijsaida'),
(15, 13, 'tes', 'Lorem doloribus fugi', 'tidak ada'),
(18, 18, 'algoritma', 'Lorem doloribus fugi', 'sasada'),
(19, 18, 'ngoding', 'asdasdas', 'tidak ada');

INSERT INTO `penilaian` (`id`, `id_user`, `id_kelompok`, `id_praktikum`, `id_modul`, `id_shift`, `nilai_tp`, `nilai_praktikum`, `nilai_fd`, `nilai_laporan_tugas`, `nilai_responsi`, `nilai_total`) VALUES
(3, 1, 1, NULL, 1, 1, 70, 75, 70, 80, 65, 95);
INSERT INTO `penilaian` (`id`, `id_user`, `id_kelompok`, `id_praktikum`, `id_modul`, `id_shift`, `nilai_tp`, `nilai_praktikum`, `nilai_fd`, `nilai_laporan_tugas`, `nilai_responsi`, `nilai_total`) VALUES
(4, 1, 1, NULL, 1, 1, 80, 75, 70, 80, 65, 95);
INSERT INTO `penilaian` (`id`, `id_user`, `id_kelompok`, `id_praktikum`, `id_modul`, `id_shift`, `nilai_tp`, `nilai_praktikum`, `nilai_fd`, `nilai_laporan_tugas`, `nilai_responsi`, `nilai_total`) VALUES
(5, 1, 1, NULL, 1, 1, 80, 75, 70, 80, 65, 95);
INSERT INTO `penilaian` (`id`, `id_user`, `id_kelompok`, `id_praktikum`, `id_modul`, `id_shift`, `nilai_tp`, `nilai_praktikum`, `nilai_fd`, `nilai_laporan_tugas`, `nilai_responsi`, `nilai_total`) VALUES
(6, 8, NULL, 17, 13, 1, 90, 89, 75, 90, 70, 80),
(7, 3, NULL, 17, 13, 1, 80, 75, 90, 65, 0, 100),
(8, 17, NULL, 18, 18, 1, 70, 60, 60, 60, 60, 61),
(9, 3, NULL, 18, 18, 1, 80, 85, 75, 75, 75, 77.5),
(10, 17, NULL, 16, 6, 1, 85, 45, 95, 45, 54, 45),
(11, 16, NULL, 18, 18, 1, 80, 80, 80, 80, 60, 74);

INSERT INTO `praktikum` (`id_praktikum`, `lab_id`, `name`, `modul`, `code`) VALUES
(1, 1, 'Praktikum Pemrograman Dasar', 'Modul 1: Python, Modul 2: Java', NULL);
INSERT INTO `praktikum` (`id_praktikum`, `lab_id`, `name`, `modul`, `code`) VALUES
(2, 1, 'Praktikum Rekayasa Perangkat Lunak', 'Modul 1: Agile, Modul 2: Waterfall', NULL);
INSERT INTO `praktikum` (`id_praktikum`, `lab_id`, `name`, `modul`, `code`) VALUES
(3, 1, 'Praktikum Pemrograman Perangkat Bergerak', 'Modul 1: Android, Modul 2: Native', NULL);
INSERT INTO `praktikum` (`id_praktikum`, `lab_id`, `name`, `modul`, `code`) VALUES
(4, 1, 'Praktikum RPLBK', 'Modul 1: Dasar RPLBK', NULL),
(5, 1, 'Praktikum Sistem Basis Data', 'Modul 1: SQL Dasar, Modul 2: SQL Lanjut', NULL),
(6, 2, 'Praktikum Multimedia', 'Modul 1: Pengenalan Multimedia', NULL),
(7, 3, 'Praktikum Pengenalan Jaringan Komputer', 'Modul 1: Dasar Jaringan', NULL),
(8, 3, 'Praktikum Switching Routing Wireless Essentials', 'Modul 1: Switching, Modul 2: Routing', NULL),
(9, 4, 'Praktikum Elektronika Dasar', 'Modul 1: Dasar Elektronika', NULL),
(10, 4, 'Praktikum Sistem Digital', 'Modul 1: Gerbang Logika', NULL),
(11, 4, 'Praktikum Teknik Mikroprosessor dan Antarmuka', 'Modul 1: Mikroprosessor Dasar', NULL),
(12, 4, 'Praktikum Sistem Digital Lanjut', 'Modul 1: Sistem Digital Kompleks', NULL),
(13, 4, 'Praktikum Teknik Kendali dan Otomasi', 'Modul 1: Dasar Kendali', 'Prak'),
(16, 1, 'Praktikum Elektronika Lanjutan', 'Modul 1: Pengenalan, Modul 2: Komponen', 'elektro'),
(17, 1, 'Praktikum Iqi', 'Veritatis consectetu', 'testingg'),
(18, 3, 'pemograman dasar', 'Modul 1: Dasar Kendali', 'program');

INSERT INTO `presensi` (`id`, `id_user`, `id_praktikum`, `id_modul`, `id_shift`, `status`, `waktu_presensi`) VALUES
(1, 3, 1, 2, 1, 'Izin', '2025-04-18 13:32:39');
INSERT INTO `presensi` (`id`, `id_user`, `id_praktikum`, `id_modul`, `id_shift`, `status`, `waktu_presensi`) VALUES
(2, 3, 1, 1, 1, 'Sakit', '2025-04-18 13:54:50');
INSERT INTO `presensi` (`id`, `id_user`, `id_praktikum`, `id_modul`, `id_shift`, `status`, `waktu_presensi`) VALUES
(3, 3, 2, 3, 1, 'Hadir', '2025-04-18 13:55:02');
INSERT INTO `presensi` (`id`, `id_user`, `id_praktikum`, `id_modul`, `id_shift`, `status`, `waktu_presensi`) VALUES
(4, 3, 1, 3, 1, 'Hadir', '2025-04-22 16:01:59'),
(5, 3, 17, 13, 1, 'Hadir', '2025-04-29 16:11:38'),
(6, 8, 17, 13, 1, 'Hadir', '2025-04-29 18:21:57'),
(7, 8, 17, 14, 1, 'Izin', '2025-04-29 18:22:27'),
(8, 17, 18, 18, 1, 'Hadir', '2025-04-30 20:42:05'),
(9, 3, 18, 19, 1, 'Izin', '2025-04-30 20:42:18'),
(11, 3, 18, 18, 1, 'Izin', '2025-04-30 21:32:15'),
(12, 16, 18, 18, 1, 'Hadir', '2025-05-06 19:15:22');

INSERT INTO `shift` (`id_shift`, `nama_shift`, `deskripsi`) VALUES
(1, 'Shift 1', '07.00 - 09.00');
INSERT INTO `shift` (`id_shift`, `nama_shift`, `deskripsi`) VALUES
(2, 'Shift 2', '10.00 - 12.00');
INSERT INTO `shift` (`id_shift`, `nama_shift`, `deskripsi`) VALUES
(3, 'Shift 3', '13.00 - 15.00');
INSERT INTO `shift` (`id_shift`, `nama_shift`, `deskripsi`) VALUES
(4, 'Shift 4', '16.00 - 18.00');

INSERT INTO `users` (`id_user`, `full_name`, `nim`, `email`, `password`, `role`, `angkatan`, `created_at`, `updated_at`) VALUES
(1, 'admin', '12345671', 'admin@gmail.com', '$2b$10$LMQeeOeGSNdMxvjvP/8WI.xooUzyWicJa66AA3EOvuSP2b.xKxmCG', 'admin', '2021', '2025-03-01 15:53:27', '2025-04-25 21:59:21');
INSERT INTO `users` (`id_user`, `full_name`, `nim`, `email`, `password`, `role`, `angkatan`, `created_at`, `updated_at`) VALUES
(3, 'Praktikan Satu', '12345678', 'praktikan1@email.com', '$2b$10$LMQeeOeGSNdMxvjvP/8WI.xooUzyWicJa66AA3EOvuSP2b.xKxmCG', 'praktikan', '2021', '2025-03-02 11:35:04', '2025-04-12 09:22:47');
INSERT INTO `users` (`id_user`, `full_name`, `nim`, `email`, `password`, `role`, `angkatan`, `created_at`, `updated_at`) VALUES
(4, 'Asisten Praktikum Satu', '11223344', 'asisten1@email.com', '$2b$10$LMQeeOeGSNdMxvjvP/8WI.xooUzyWicJa66AA3EOvuSP2b.xKxmCG', 'asisten', '2021', '2025-03-02 11:42:26', '2025-04-29 14:14:03');
INSERT INTO `users` (`id_user`, `full_name`, `nim`, `email`, `password`, `role`, `angkatan`, `created_at`, `updated_at`) VALUES
(5, 'Nama Asisten', '12345690', 'asisten2@email.com', '$2b$10$i4C7y1i.Kf3mYZzKueb7hOLAkOhmLujO0wddtzfbtw9L1/Y8Y9V/O', 'asisten', '2023', '2025-03-02 18:03:06', '2025-03-02 18:03:06'),
(8, 'John Doe', '12345618', 'johndoe@example.com', '$2b$10$LMQeeOeGSNdMxvjvP/8WI.xooUzyWicJa66AA3EOvuSP2b.xKxmCG', 'admin', '2022', '2025-04-12 09:22:31', '2025-04-25 22:16:58'),
(9, 'John Doe', '123456181', 'johndoe@example.coms', '$2b$10$CV5Sbfq2cNah/kCvOyUuw.KhJbT6qlMye0l59JdxPLkcgcyo8Sv.S', 'praktikan', '2022', '2025-04-25 22:22:12', '2025-04-25 22:22:12'),
(10, 'Zane Wilkins', 'Voluptas quis facili', 'lyjoja@mailinator.com', '$2b$10$z4fc1viEC8j3jRWe4VjZHepr/ojXPUpnJ1eOQkaQTiB8FesXRz/Hm', 'admin', '2020', '2025-04-26 15:07:12', '2025-04-26 15:07:12'),
(11, 'Testing', '1312312', 'qywafyzok@mailinator.coms', '$2b$10$BfasI5TGu3utWyBw4QbzwOC/b7B9uuGxcqVBAC0VM0gZISVO/bb4C', 'praktikan', '2023', '2025-04-26 15:09:52', '2025-04-26 16:05:15'),
(12, 'Regan Russo', 'Autem ullam numquam ', 'mixyw@mailinator.com', '$2b$10$GTgKYoqcVtdh93A1OpRJ9udW/QiOJ0xKCCkplcpXsEeGkSbwstsjK', 'admin', '2018', '2025-04-26 16:05:49', '2025-04-26 16:05:49'),
(13, 'Kadeem Mclaughlin', 'Excepteur enim cum f', 'zecytaryja@mailinator.com', '$2b$10$ySAfxK/a0LXx/hGDJz5sJepBFitAZQcaYFE2.8biJlOTHzsQM5n7e', 'admin', '2020', '2025-04-26 16:05:54', '2025-04-26 16:05:54'),
(14, 'Kyla Gordon', 'Occaecat amet qui o', 'zywygate@mailinator.com', '$2b$10$HfFQLLn3MljhpacxF28eWeC9Y1LMvYuyUKu4fVprWOMocDiz/k2xC', 'praktikan', '2021', '2025-04-26 16:05:59', '2025-04-26 16:07:10'),
(15, 'Fletcher Bright', 'Magnam amet sit nul', 'nakusira@mailinator.com', '$2b$10$rTlFIJTINKBf./CULQT0f.wx7oXu.8WRrRrGoNTXHvSAzo/4v2mcC', 'praktikan', '2020', '2025-04-26 16:07:18', '2025-04-26 16:07:18'),
(16, 'tesstingg', 'Reprehenderit eum e', 'alt.f2-6on7hyou@yopmail.com', '$2b$10$Hv89m4FYATcfzozrf87Qaer2DL8MJzBuEVmr2tzgQBC5HWC8ZC8dK', 'praktikan', '2025', '2025-04-30 08:35:09', '2025-05-06 20:05:58'),
(17, 'praktikan testing', '123123123123', 'praktikan2@email.com', '$2b$10$VLGXgZHaCyJHN3cPmQztPexE4RbkwujoIhPIlXFtxSOywFq4MBtui', 'praktikan', '2021', '2025-04-30 20:35:37', '2025-04-30 20:35:58');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;