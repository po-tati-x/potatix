import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api-service';
import type { Module, CreateModuleData } from '../types/api';
import { courseKeys } from './course-hooks';

// Query key constants
const MODULE_KEY = 'modules';
export const moduleKeys = {
  all: (courseId: string) => [...courseKeys.detail(courseId), MODULE_KEY],
  detail: (courseId: string, moduleId: string) => [...courseKeys.detail(courseId), MODULE_KEY, moduleId]
};

// Get modules by course
export function useModulesByCourse(courseId: string) {
  return useQuery({
    queryKey: moduleKeys.all(courseId),
    queryFn: () => apiService.modules.getAll(courseId),
    enabled: !!courseId
  });
}

// Get a module by ID
export function useModule(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: moduleKeys.detail(courseId, moduleId),
    queryFn: () => apiService.modules.getById({ courseId, moduleId }),
    enabled: !!courseId && !!moduleId
  });
}

// Create a new module
export function useCreateModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string, data: CreateModuleData }) => 
      apiService.modules.create({ courseId, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
}

// Update a module
export function useUpdateModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, moduleId, data }: { courseId: string, moduleId: string, data: Partial<Module> }) => 
      apiService.modules.update({ courseId, moduleId, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ 
        queryKey: moduleKeys.detail(variables.courseId, variables.moduleId) 
      });
    }
  });
}

// Delete a module
export function useDeleteModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: string, moduleId: string }) => 
      apiService.modules.delete({ courseId, moduleId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
} 

// Reorder modules
export function useReorderModules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, modules }: { courseId: string, modules: { id: string; order: number }[] }) => 
      apiService.modules.reorder({ courseId, modules }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
} 