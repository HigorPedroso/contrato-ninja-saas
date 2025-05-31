import { ReactNode } from "react";
import { Menu } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  children: ReactNode;
}

const MobileSidebar = ({ isOpen, toggleSidebar, children }: MobileSidebarProps) => {
  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default MobileSidebar;