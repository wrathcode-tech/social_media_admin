import { useTheme } from '../../context/ThemeContext';

/** Light UI → dark mark; dark UI → light mark (files in /public). */
export default function BrandLogo({ className = '', alt = 'GTBS Flicksy' }) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/sm_logo_light.svg' : '/sm_logo_dark.svg';

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain object-left ${className}`}
      width={367}
      height={94}
      decoding="async"
    />
  );
}
