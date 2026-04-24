import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

interface Props {
  element: React.ReactElement;
  niveis?: number[];
}

export default function PrivateRoute({ element, niveis }: Props) {
  const user = getUser();

  if (!user) return <Navigate to="/" replace />;

  if (niveis && !niveis.includes(user.nivel)) {
    return <Navigate to="/home" replace />;
  }

  return element;
}