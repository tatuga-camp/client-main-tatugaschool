import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalStorage, setLocalStorage } from "../utils";
import { Language } from "../interfaces";

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
    mutationFn: (request: Language) => {
      setLocalStorage("language", request);
      queryClient.setQueryData(["language"], request);
      return Promise.resolve(request); // Ensure it returns a Promise
    },
  });
}
