import {
  Activity,
  AlertCircle,
  Award,
  Eye,
  Flame,
  Layers,
  Skull,
  Star,
  TrendingDown,
  TrendingUp,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

const REGISTRY: Record<string, LucideIcon> = {
  Activity,
  AlertCircle,
  Award,
  Eye,
  Flame,
  Layers,
  Skull,
  Star,
  TrendingDown,
  TrendingUp,
  Wheat,
};

interface Props {
  name: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className, size = 18 }: Props) {
  const Component = REGISTRY[name] ?? AlertCircle;
  return <Component className={className} size={size} />;
}
