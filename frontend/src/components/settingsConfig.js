// settingsConfig.js - shared sections for all settings pages
import { User, Settings, Layout, Bell, Lock, CreditCard, Mail, Key, Building, Users, Shield, ChevronRight } from "lucide-react";

export const SECTIONS = [
  { id: "profile",      icon: User,        label: "Public profile" },
  { id: "account",      icon: Settings,    label: "Account" },
  { id: "appearance",   icon: Layout,      label: "Appearance" },
  { id: "notifications",icon: Bell,        label: "Notifications" },
  { section: "ACCESS" },
  { id: "emails",       icon: Mail,        label: "Emails" },
  { id: "password",     icon: Lock,        label: "Password and authentication" },
  { id: "sessions",     icon: Shield,      label: "Sessions" },
  { id: "ssh",          icon: Key,         label: "SSH and GPG keys" },
  { id: "organizations",icon: Building,    label: "Organizations", path: "/settings/organizations" }
];
