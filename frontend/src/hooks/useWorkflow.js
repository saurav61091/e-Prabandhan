import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useWorkflow = (workflowId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflow, setWorkflow] = useState(null);

  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getWorkflow(workflowId);
      setWorkflow(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  const approveStep = useCallback(async (stepId, data) => {
    if (!workflowId || !stepId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.approveWorkflowStep(workflowId, stepId, data);
      await fetchWorkflow(); // Refresh workflow data
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId, fetchWorkflow]);

  const rejectStep = useCallback(async (stepId, data) => {
    if (!workflowId || !stepId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.rejectWorkflowStep(workflowId, stepId, data);
      await fetchWorkflow(); // Refresh workflow data
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId, fetchWorkflow]);

  const updateWorkflow = useCallback(async (data) => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.updateWorkflow(workflowId, data);
      setWorkflow(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  return {
    workflow,
    loading,
    error,
    fetchWorkflow,
    approveStep,
    rejectStep,
    updateWorkflow
  };
};
