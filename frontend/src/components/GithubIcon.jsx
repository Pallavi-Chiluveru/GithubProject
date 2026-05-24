import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import darkLogo from '../assets/antigravity_logo_dark.png';
import lightLogo from '../assets/image.png';

const GithubIcon = ({ className, ...props }) => {
  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'light';
  } catch (e) {
    // Fallback if rendered outside of ThemeProvider context
  }

  const logoSrc = theme === 'dark' ? darkLogo : lightLogo;

  return (
    <img 
      src={logoSrc} 
      alt="RepoSphere" 
      className={`${className} select-none object-contain`} 
      {...props} 
    />
  );
};

export default GithubIcon;
