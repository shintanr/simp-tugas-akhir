import Navbar from "@/components/shared/navbar_submission";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-72 bg-[#0267FE] z-0"></div>
          <div className="relative z-10 pt-4">
            {/* <!-- Header --> */}
            <Navbar />
            {/* <!-- Content --> */}
            <div className="">{children}</div>
          </div>
        </div>
      </main>
      <footer className="text-center text-gray-500 text-xs py-4">
        &copy; 2025 Sistem Informasi Manajemen Praktikum
      </footer>
    </div>
  );
};

export default Layout;
