import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <div className="p-2 -ml-2">
          <Menu className="text-white" />
        </div>
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side="left">
        <SheetHeader>
          <SheetTitle>
            <VisuallyHidden>Menu Lateral</VisuallyHidden>
          </SheetTitle>
        </SheetHeader>
        <Sidebar className="w-full" />
      </SheetContent>
    </Sheet>
  );
};
