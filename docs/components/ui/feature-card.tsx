import Link from 'next/link';
import { DocsRoute } from '../../constants/routes';

interface FeatureCardProps {
  title: string;
  description: string;
  href: DocsRoute;
  icon?: string;
}

export default function FeatureCard({ title, description, href, icon = '📚' }: FeatureCardProps) {
  return (
    <Link 
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
} 