import {
  Pill, Sparkles, Droplet, Scissors, HeartPulse, Baby, Apple, Home,
  PawPrint, Leaf, Shield, FlaskConical, Dog, Droplets, Stethoscope,
  Heart, LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  pill: Pill,
  sparkles: Sparkles,
  droplet: Droplet,
  scissors: Scissors,
  "flower-2": Sparkles,
  "heart-pulse": HeartPulse,
  stethoscope: Stethoscope,
  baby: Baby,
  heart: Heart,
  apple: Apple,
  home: Home,
  "paw-print": PawPrint,
  leaf: Leaf,
  shield: Shield,
  "flask-conical": FlaskConical,
  dog: Dog,
  droplets: Droplets,
};

export function getCategoryIcon(icon?: string | null): LucideIcon {
  return (icon && ICONS[icon]) || Pill;
}
