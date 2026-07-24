import { useParams, Navigate } from 'react-router';
import { labs } from '../labs';
import { ComingSoon } from './practice/ComingSoon';

export function LabFallback() {
  const { slug } = useParams<{ slug: string }>();
  const lab = labs.find((l) => l.slug === slug);

  if (!lab) return <Navigate to="/" replace />;

  return <ComingSoon lab={lab} />;
}
