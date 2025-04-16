
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { 
  DropletIcon, 
  HomeIcon, 
  MapIcon, 
  BellIcon, 
  DatabaseIcon, 
  SettingsIcon, 
  UsersIcon, 
  BarChart3Icon, 
  LogOutIcon, 
  AlertTriangleIcon,
  FileTextIcon,
  FileIcon,
  FilePlusIcon,
  FileMinusIcon,
  FileCheckIcon,
  PenSquare,
  ChartNoAxesCombinedIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { user, profile, logout, hasPermission } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  // Navigation items based on role
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: HomeIcon,
      active: location.pathname === "/",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR, UserRole.PROFESSOR],
    },
    {
      name: "Données sur les eaux",
      href: "/water-data",
      icon: DropletIcon,
      active: location.pathname.startsWith("/water-data"),
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR, UserRole.PROFESSOR],
    },
    {
      name: "Visualisation avancée",
      href: "/advanced-visualization",
      icon: ChartNoAxesCombinedIcon,
      active: location.pathname === "/advanced-visualization",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR],
    },
    {
      name: "Vue de la carte",
      href: "/map",
      icon: MapIcon,
      active: location.pathname === "/map",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR, UserRole.PROFESSOR],
    },
    {
      name: "Saisie des données",
      href: "/data-entry",
      icon: PenSquare,
      active: location.pathname === "/data-entry",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR],
    },
    {
      name: "Alertes",
      href: "/alerts",
      icon: BellIcon,
      active: location.pathname === "/alerts",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR],
    },
    {
      name: "Plans PGES",
      href: "/pges-plans",
      icon: FileTextIcon,
      active: location.pathname === "/pges-plans",
      roles: [UserRole.ADMIN, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR, UserRole.PROFESSOR],
    },
    {
      name: "Rapports",
      href: "/reports",
      icon: BarChart3Icon,
      active: location.pathname === "/reports",
      roles: [UserRole.ADMIN, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR, UserRole.PROFESSOR],
    },
    {
      name: "Analyse des risques",
      href: "/risk-analysis",
      icon: AlertTriangleIcon,
      active: location.pathname === "/risk-analysis",
      roles: [UserRole.ADMIN, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR, UserRole.DIRECTOR],
    },
    {
      name: "Gestion des données",
      href: "/data-management",
      icon: DatabaseIcon,
      active: location.pathname === "/data-management",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT],
    },
    {
      name: "Gestion des utilisateurs",
      href: "/users",
      icon: UsersIcon,
      active: location.pathname === "/users",
      roles: [UserRole.ADMIN],
    },
    {
      name: "Paramètres",
      href: "/settings",
      icon: SettingsIcon,
      active: location.pathname === "/settings",
      roles: [UserRole.ADMIN, UserRole.SITE_AGENT, UserRole.EXTERNAL_SUPERVISOR, UserRole.INTERNAL_SUPERVISOR],
    },
  ];
  
  const filterNavItems = () => {
    return navigationItems.filter(item => {
      return item.roles.some(role => hasPermission(role));
    });
  };
  
  return (
    <div className="h-screen flex flex-col bg-white border-r border-gray-200 w-64 fixed">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <DropletIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-primary">Eau Vigilance</span>
        </div>
      </div>
      
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {filterNavItems().map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-primary/10"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  item.active ? "text-white" : "text-gray-500 group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-gray-500">
                  {profile?.name ? profile.name.split(" ").map((n:string) => n[0]).join("") : ""}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{profile?.name}</span>
              <span className="text-xs text-gray-500 capitalize">{profile?.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-gray-500 hover:text-primary transition-colors rounded-md"
          >
            <LogOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
