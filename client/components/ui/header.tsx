import React from "react";
import { BookOpen, ClipboardList, FileCheck, NotebookPen, Award } from "lucide-react";

// Simple Avatar component implementation
const Avatar = ({ children, className }) => (
  <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={`aspect-square h-full w-full ${className}`} />
);

const AvatarFallback = ({ children, className }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-300 ${className}`}>
    {children}
  </div>
);

const Header = () => {
  const menuItems = [
    {
      title: "Praktikum",
      icon: <BookOpen className="w-5 h-5" />,
      url: "http://localhost:3000/"
    },
    {
      title: "TP",
      icon: <NotebookPen className="w-5 h-5" />,
      url: "http://localhost:3000/tugas-pendahuluan"
    },
    {
      title: "Presensi",
      icon: <ClipboardList className="w-5 h-5" />,
      url: "http://localhost:3000/presensi"
    },
    {
      title: "Submission",
      icon: <FileCheck className="w-5 h-5" />,
      url: "http://localhost:3000/submission_praktikan"
    },
    {
      title: "Penilaian",
      icon: <Award className="w-5 h-5" />,
      url: "http://localhost:3000/penilaian"
    }
  ];

  return (
    <header className="w-full bg-[#0267FE] shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="h-16 px-8 flex items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-1/4"></div> {/* Spacer kiri */}
          <nav className="flex-1 flex justify-center space-x-6">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.url}
                className="flex items-center space-x-2 text-white hover:text-[#FFFF77] transition-colors duration-200 group"
              >
                <div className="group-hover:text-[#FFFF77]">{item.icon}</div>
                <span className="font-medium">{item.title}</span>
              </a>
            ))}
          </nav>
          <div className="w-1/4 flex justify-end items-center space-x-3">
            <span className="text-white font-medium">John Doe</span>
            <Avatar className="h-10 w-10">
              
              <AvatarFallback className="bg-gray-200 text-gray-600">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;