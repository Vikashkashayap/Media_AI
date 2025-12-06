import { Link } from 'react-router-dom';

export default function Logo({ className = '', linkTo = '/', size = 'default' }) {
  const sizeClasses = {
    small: 'h-48 w-auto',
    default: 'h-48 w-auto',
    large: 'h-48 w-auto',
  };

  const LogoContent = () => (
    <img
      src="/image.png"
      alt="Media24.com Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
      style={{ maxHeight: '100%' }}
    />
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="group flex items-center">
        <LogoContent />
      </Link>
      
    );
  }

  return (
    <div className="flex items-center">
      <LogoContent />
    </div>
  );
}

