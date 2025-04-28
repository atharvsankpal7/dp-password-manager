import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Facebook, Twitter, Instagram, Linkedin, Globe, Github, Youtube, Twitch, Mail, Key, Smartphone, Database, DivideIcon as LucideIcon } from 'lucide-react';
import React from 'react';


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
} 

interface SocialMediaIconMap {
  [key: string]:typeof LucideIcon;
}

const socialMediaIcons: SocialMediaIconMap = {
  'Facebook': Facebook,
  'Twitter': Twitter,
  'Instagram': Instagram,
  'LinkedIn': Linkedin,
  'GitHub': Github,
  'YouTube': Youtube,
  'Twitch': Twitch,
  'Email': Mail,
  'Website': Globe,
  'Database': Database,
  'Mobile': Smartphone,
  'Default': Key,
};

export function getSocialMediaIcon(platform: string, className?: string): React.ReactElement {
  const IconComponent = socialMediaIcons[platform] || socialMediaIcons.Default;
  return React.createElement(IconComponent, { className });
}