import { currentDate } from "@/helper/currentDate";
import { useStaffData } from "../hooks/useStaffData";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

const AdminHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { staff, staffRole } = useStaffData();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex item-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/** Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-200 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <DynamicIcon name="Menu" size={16} />
        </button>
        <div>
          <p className="text-xs lg:text-lg text-slate-500 mt-1">
            {currentDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/** Notifications */}
        <button className="relative p-2 lg:p-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
          <DynamicIcon name="Bell" size={20} />
          <div className="absolute top-1 lg:top-2 right-1 lg:right-2 rounded-full h-2 w-2 bg-red-500" />
        </button>

        {/** Profile */}
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {`${staff?.firstName ?? "--"} ${staff?.lastName ?? "--"}`}{" "}
            </p>
            <p className="text-xs text-slate-500">{staffRole ?? "--"}</p>
          </div>

          <DynamicIcon name="CircleUser" size={24} />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
