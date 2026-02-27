import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LocalRefineryJob } from '../api/types'

const JOBS_KEY = ['refinery', 'jobs']

export function useLocalRefineryJobs() {
  return useQuery<LocalRefineryJob[]>({
    queryKey: JOBS_KEY,
    queryFn: () => window.api.refineryJobs.getAll(),
    staleTime: Infinity
  })
}

export function useAddRefineryJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (job: Omit<LocalRefineryJob, 'id' | 'dateAdded'>) =>
      window.api.refineryJobs.add(job),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY })
  })
}

export function useUpdateRefineryJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (job: LocalRefineryJob) => window.api.refineryJobs.update(job),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY })
  })
}

export function useRemoveRefineryJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => window.api.refineryJobs.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY })
  })
}
