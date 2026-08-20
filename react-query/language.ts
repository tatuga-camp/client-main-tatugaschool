import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalStorage, setLocalStorage } from "../utils";
import { Language } from "../interfaces";
import { UpdateUserService } from "../services";

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = getLocalStorage("language") as Language | null;
  if (stored === "en" || stored === "th") return stored;
  const browser = (window.navigator?.language ?? "").toLowerCase();
  return browser.startsWith("th") ? "th" : "en";
}

export function useGetLanguage() {
  return useQuery({
    queryKey: ["language"],
    queryFn: () => detectInitialLanguage(),
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["language"],
    mutationFn: async (request: Language) => {
      setLocalStorage("language", request);
      queryClient.setQueryData(["language"], request);
      // Best-effort server sync so emails follow the preference. On the
      // unauthenticated auth pages this 401s — the local switch stands.
      try {
        const user = await UpdateUserService({ language: request });
        queryClient.setQueryData(["user"], user);
      } catch {
        // not signed in / offline — ignore
      }
      return request;
    },
  });
}
