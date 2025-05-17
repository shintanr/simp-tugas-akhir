"use client";

import {
  BarChart3,
  BookOpenCheck,
  BookUser,
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

  // untuk manejemen modul
  {
    title: "Manajemen Modul",
    url: "/admin/modules",
    icon: BookUser,
    activeUrl: ["/admin/modules", "/admin/modules/create"],
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
          <SidebarGroupLabel className="h-20">
            <Image
              src="/logo/Logo.svg"
              alt="Logo"
              width={80}
              height={80}
              priority
              className="object-contain"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {!pathname.startsWith("/admin") &&
              session.user.role !== "admin" && (
                <div className="my-2">
                  <SelectLabDropdown />
                </div>
              )}
            <SidebarMenu>
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
