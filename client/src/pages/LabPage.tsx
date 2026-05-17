import { useParams, Navigate } from 'react-router-dom';
import { labs } from '../labs';
import { ComingSoon } from './practice/ComingSoon';

export function LabPage() {
  const { slug } = useParams<{ slug: string }>();
  const lab = labs.find((l) => l.slug === slug);

  if (!lab) return <Navigate to="/" replace />;

  return <ComingSoon lab={lab} />;
}
