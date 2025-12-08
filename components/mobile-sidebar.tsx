import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white" />
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side="left">
          <SheetTitle>
            <VisuallyHidden>Menu Lateral</VisuallyHidden>
          </SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
