import logo from '../assets/antigravity_logo_dark.png';

const GithubIcon = ({ className, ...props }) => {
  return (
    <img 
      src={logo} 
      alt="antigravity"
      className={`${className} select-none`} 
      {...props} 
    />
  );
};

export default GithubIcon;
