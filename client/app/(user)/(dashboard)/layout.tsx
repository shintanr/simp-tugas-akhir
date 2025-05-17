import UserSidebar from "@/components/shared/userSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset className="overflow-hidden">
          <SidebarTrigger />
          <main>
            {/* <Header /> */}
            <div className="flex-1 flex flex-col mx-auto p-10 w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      {/* footer */}
    </>
  );
};

export default Layout;
