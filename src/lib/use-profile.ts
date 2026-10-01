import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/server/profiles";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function useProfile() {
  const { user, isPending: authPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
  });
  return {
    user,
    authPending,
    profile: query.data ?? null,
    profilePending: Boolean(user) && query.isPending,
    refetch: query.refetch,
  };
}
