import React from "react";
import {
  Folder,
  MessageCircle,
  Globe,
  Heart,
  ShoppingCart,
  Sparkles,
  Layers,
  Code,
  Smartphone,
  Cpu,
} from "lucide-react";

interface ProjectIconProps {
  icon?: string | null;
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ProjectIcon({
  icon,
  name,
  color = "#2563eb",
  size = "md",
  className = "",
}: ProjectIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs rounded-lg",
    md: "w-8 h-8 text-sm rounded-lg",
    lg: "w-10 h-10 text-base rounded-xl",
    xl: "w-14 h-14 text-xl rounded-2xl",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 30,
  };

  const currentIconSize = iconSizes[size];
  const initial = (name || "P").charAt(0).toUpperCase();

  const renderIcon = () => {
    switch (icon?.toLowerCase()) {
      case "whatsapp":
      case "message-circle":
        return <MessageCircle size={currentIconSize} className="text-white fill-white/10" />;
      case "globe":
        return <Globe size={currentIconSize} className="text-white" />;
      case "heart":
        return <Heart size={currentIconSize} className="text-white fill-white/10" />;
      case "shopping-cart":
      case "cart":
        return <ShoppingCart size={currentIconSize} className="text-white" />;
      case "sparkles":
      case "ai":
        return <Sparkles size={currentIconSize} className="text-white" />;
      case "layers":
        return <Layers size={currentIconSize} className="text-white" />;
      case "code":
        return <Code size={currentIconSize} className="text-white" />;
      case "mobile":
      case "smartphone":
        return <Smartphone size={currentIconSize} className="text-white" />;
      case "cpu":
        return <Cpu size={currentIconSize} className="text-white" />;
      case "folder":
        return <Folder size={currentIconSize} className="text-white" />;
      default:
        return (
          <span className="font-semibold text-white tracking-tight select-none">
            {initial}
          </span>
        );
    }
  };

  return (
    <div
      className={`flex items-center justify-center shrink-0 shadow-sm transition-transform ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color || "#2563eb" }}
    >
      {renderIcon()}
    </div>
  );
}
