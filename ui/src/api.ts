import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BinResponseSchema, BinSchema, RequestsResponseSchema } from "./schemas";

export function useLoadBins() {
	return useQuery({
		queryKey: ["bins"],
		queryFn: async () => {
			const res = await fetch("/api/bins");
			const json = await res.json();
			return BinResponseSchema.parse(json);
		},
	});
}

export function useLoadRequests(binId: string, page: number) {
	return useQuery({
		queryKey: ["bins", binId, page],
		queryFn: async () => {
			const res = await fetch(`/api/bins/${binId}?page=${page}`);
			const json = await res.json();
			const parsed = RequestsResponseSchema.safeParse(json);
			if (parsed.success) {
				return parsed.data;
			}

			console.error("Failed to parse requests response", parsed.error);
		},
	});
}

export function useCreateBin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/bins", {
				method: "POST",
			});
			const json = await res.json();
			return BinSchema.parse(json);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bins"] });
		},
	});
}
