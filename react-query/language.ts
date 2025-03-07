import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalStorage, setLocalStorage } from "../utils";
import { Language } from "../interfaces";

export function useGetLanguage() {
  return useQuery({
    queryKey: ["language"],
    queryFn: () => {
      const language = getLocalStorage("language") as Language;
      if (language) {
        return language;
      } else {
        return "en";
      }
    },
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
