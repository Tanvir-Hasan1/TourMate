import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../src/store/useTripStore';

export default function TripDetailRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setActiveTrip } = useTripStore();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setActiveTrip(id);
      router.replace('/(tabs)');
    }
  }, [id]);

  return null;
}
