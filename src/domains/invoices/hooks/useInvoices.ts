import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import type { Invoice } from "../types";
import {
  createInvoiceDraft,
  fetchInvoicesBySeller,
  markInvoiceSent,
  updateInvoice,
} from "../services/invoiceService";

type CreateDraftParams = Parameters<typeof createInvoiceDraft>[0];

type UseInvoicesResult = {
  invoices: Invoice[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createDraft: (params: CreateDraftParams) => Promise<string>;
  saveInvoice: (invoiceId: string, patch: Partial<Invoice>) => Promise<void>;
  sendInvoice: (invoiceId: string) => Promise<void>;
};

export function useInvoices(): UseInvoicesResult {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoicesBySeller(currentUser.uid);
      setInvoices(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDraft = useCallback(
    async (params: CreateDraftParams): Promise<string> => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const { invoiceId } = await createInvoiceDraft(params);
      return invoiceId;
    },
    [currentUser]
  );

  const saveInvoice = useCallback(
    async (invoiceId: string, patch: Partial<Invoice>) => {
      await updateInvoice(invoiceId, patch);
    },
    []
  );

  const sendInvoice = useCallback(async (invoiceId: string) => {
    await markInvoiceSent(invoiceId);
  }, []);

  return {
    invoices,
    loading,
    error,
    refresh,
    createDraft,
    saveInvoice,
    sendInvoice,
  };
}
