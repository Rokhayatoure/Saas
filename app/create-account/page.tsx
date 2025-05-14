'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CreateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createUserAndOrg = async () => {
      try {
        // Vérifie que la session_id est présente
        if (!sessionId) throw new Error('Session ID manquante');

        // Appel API pour créer l'utilisateur et l'organisation
        const res = await fetch('/api/create-user-org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) throw new Error('Erreur lors de la création de l\'utilisateur et de l\'organisation');

        // Redirection vers le dashboard après création réussie
        router.push('/dashboard');
      } catch (error) {
        console.error('Erreur de création utilisateur/organisation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      createUserAndOrg();
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p>Création de votre compte en cours...</p>
      ) : (
        <p>Redirection...</p>
      )}
    </div>
  );
}
