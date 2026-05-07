import { useState } from "react";

export const usePasswordToggle = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toggle = () => setIsVisible(prev => !prev);
  return [isVisible, toggle] as const;
};