interface PaymentButtonType {
  isActive: boolean;
  method: string;
  subTitle: string;
  handleMethodChange: (method: string) => void;
  icon: React.ComponentType<{ size?: number; className?: string }>; // Proper Type
}

const PaymentButton = ({
  isActive,
  method,
  subTitle,
  handleMethodChange,
  icon: Icon,
}: PaymentButtonType) => {
  return (
    <button
      onClick={() => handleMethodChange("gcash")}
      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
        isActive
          ? "border-[#e13e00] bg-[#e13e00]/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isActive ? "bg-[#e13e00]/20" : "bg-gray-100"
        }`}
      >
        <Icon
          size={24}
          className={isActive ? "text-[#e13e00]" : "text-gray-400"}
        />
      </div>
      <div className="text-left flex-1">
        <h3
          className={`font-semibold ${isActive ? "text-[#e13e00]" : "text-gray-700"}`}
        >
          {method}
        </h3>
        <p className="text-sm text-gray-500">{subTitle}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isActive ? "border-[#e13e00]" : "border-gray-300"
        }`}
      >
        {isActive && <div className="w-3 h-3 rounded-full bg-[#e13e00]" />}
      </div>
    </button>
  );
};

export default PaymentButton;
