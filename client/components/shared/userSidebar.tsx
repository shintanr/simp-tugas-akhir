"use client";

import {
  BarChart3,
  BookOpenCheck,
  ChevronDown,
  ClipboardCheck,
  FileUp,
  Home,
  Laptop2,
  LucideProps,
  UsersRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import SelectLabDropdown from "./selectLabDropdown";

interface MenuItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  activeUrl: string[];
  subMenu?: {
    title: string;
    url: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    activeUrl: string[];
  }[]; // Add this line
}

// Menu items.
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Laptop2,
    activeUrl: ["/admin/dashboard"],
  },
  {
    title: "Manajemen Pengguna",
    url: "/admin/users",
    icon: UsersRound,
    activeUrl: ["/admin/users", "/admin/users/create"],
  },
  {
    title: "Manajemen Praktikum",
    url: "/admin/praktikum",
    icon: Home,
    activeUrl: ["/admin/praktikum"],
  },

  {
    title: "Praktikum",
    url: "/",
    icon: Laptop2,
    activeUrl: ["/"],
  },
  {
    title: "Modul",
    url: "/",
    icon: BookOpenCheck,
    activeUrl: ["/modul"],
  },
  {
    title: "Presensi",
    url: "/",
    icon: ClipboardCheck,
    activeUrl: ["/presensi"],
  },
  {
    title: "Submission",
    url: "/submission",
    icon: FileUp,
    activeUrl: ["/submission"],
  },
  {
    title: "Penilaian",
    url: "/",
    icon: BarChart3,
    activeUrl: ["/penilaian"],
  },
];

const UserSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const activeMenus = items
      .filter(
        (item) =>
          item.subMenu &&
          item.subMenu.some((sub) => pathname.startsWith(sub.url))
      )
      .map((item) => item.title);

    setOpenItems(activeMenus);
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const filteredItems =
  session?.user?.role === "admin"
    ? items.filter(
        (item) =>
          item.title === "Manajemen Praktikum" ||
          item.title === "Manajemen Pengguna" ||
          item.title === "Dashboard" ||
          item.title === "Manajemen Modul" // ← Tambahkan ini
      )
    : items.filter(
        (item) =>
          item.title !== "Manajemen Praktikum" &&
          item.title !== "Manajemen Pengguna" &&
          item.title !== "Dashboard" &&
          item.title !== "Manajemen Modul" // ← Pastikan disaring untuk non-admin
      );


  if (!session) {
    return (
      <div className="w-64 h-screen bg-white p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-12 w-12 bg-muted-foreground/30 rounded-full mb-4" />
        <div className="h-8 bg-muted-foreground/20 rounded-md" />
        <div className="h-8 bg-muted-foreground/20 rounded-md" />
        <div className="h-8 bg-muted-foreground/20 rounded-md" />
        <div className="mt-auto h-10 bg-muted-foreground/30 rounded-md" />
      </div>
    );
  }

  return (
    <Sidebar className="bg-white">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="h-20 p-4">
          <h1 className="text-2xl font-bold  flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            SIMP
          </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-4 ">
            {!pathname.startsWith("/admin") &&
              session.user.role !== "admin" && (
                <div className=" ">
                  <SelectLabDropdown />
                </div>
              )}
              <h1 className="border-b border-b-blue-400 mt-4 "></h1>
            <SidebarMenu className="py-6">
              {filteredItems.map((item) => {
                const isActive = item.activeUrl.some(
                  (url) => typeof url === "string" && pathname.startsWith(url)
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.subMenu?.length ? (
                      <Collapsible
                        open={openItems.includes(item.title)}
                        onOpenChange={() => toggleMenu(item.title)}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subMenu.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive}
                                >
                                  <a href={subItem.url}>
                                    <subItem.icon />
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button 
        className="bg-black hover:bg-blue-950 text-white"
          onClick={() => {
            signOut({
              callbackUrl: "/login",
            });
          }}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;
