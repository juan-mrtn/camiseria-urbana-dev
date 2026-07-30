import { Check, XCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export default function OrderStatusBadge({ status, className = "", size = "sm" }: OrderStatusBadgeProps) {
  const normalizedStatus = (status || "").toLowerCase().trim();

  let label = "Pago Rechazado";
  let icon = <XCircle className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />;
  let colorClasses = "bg-red-100 text-red-800 border-red-300";

  switch (normalizedStatus) {
    case "confirmado":
    case "aprobado":
    case "approved":
    case "pagado":
    case "exitoso":
      label = "Pago exitoso";
      icon = <Check className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />;
      colorClasses = "bg-green-50 text-green-700 border-green-200";
      break;

    case "rechazado":
    case "rejected":
    case "cancelado":
    case "cancelled":
    case "fallido":
    case "failed":
    case "pendiente":
    case "pending":
    case "in_process":
    case "procesando":
    default:
      label = "Pago Rechazado";
      icon = <XCircle className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />;
      colorClasses = "bg-red-100 text-red-800 border-red-300";
      break;
  }

  const paddingClasses = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${paddingClasses} ${colorClasses} ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
