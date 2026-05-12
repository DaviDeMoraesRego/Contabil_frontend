import { MobileSidebar } from "./mobile-sidebar";

export const MobileHeader = () => {
  return (
    <nav
      className="bg-blue-500 lg:hidden px-6 h-[50px] flex items-center justify-between
        border-b border-blue-600 fixed top-0 w-full z-50 shadow-sm"
    >
      <div className="flex-1 flex justify-start">
        <MobileSidebar />
      </div>

      <div className="flex-[2] flex justify-center">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight italic">
          Contabil
        </h1>
      </div>

      <div className="flex-1" />
    </nav>
  );
};
