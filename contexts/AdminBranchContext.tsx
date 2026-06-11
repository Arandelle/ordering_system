"use client";

import { useBranches } from "@/hooks/api/useBranch";
import { Branch } from "@/types/branch";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AdminBranchContextType = {
  branches: Branch[];
  isLoadingBranches: boolean;
  selectedBranchId: "all" | string;
  selectedBranch: Branch | null;
  setSelectedBranchId: (branchId: "all" | string) => void;
};

type AdminBranchScope = "all" | string;

const ADMIN_SELECTED_BRANCH_KEY = "admin_selected_branch_id";

const AdminBranchContext = createContext<AdminBranchContextType | null>(null);

export const AdminBranchProvider = ({ children }: { children: ReactNode }) => {
  const { data: branches = [], isLoading: isLoadingBranches } = useBranches();

  const [selectedBranchId, setSelectedBranchIdState] =
    useState<AdminBranchScope>("all");

  // Load selected branch from session storage on mount
  useEffect(() => {
    try {
      const savedBranchId = sessionStorage.getItem(ADMIN_SELECTED_BRANCH_KEY);
      if (savedBranchId) setSelectedBranchIdState(savedBranchId);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const setSelectedBranchId = (branchId: AdminBranchScope) => {
    setSelectedBranchIdState(branchId);

    try {
      if (branchId === "all") {
        sessionStorage.removeItem(ADMIN_SELECTED_BRANCH_KEY);
      } else {
        sessionStorage.setItem(ADMIN_SELECTED_BRANCH_KEY, branchId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Always resolve against fresh API data - never stale
  const selectedBranch =
    branches.find((branch) => branch._id === selectedBranchId) ?? null;

  return (
    <AdminBranchContext
      value={{
        branches,
        isLoadingBranches,
        selectedBranchId,
        selectedBranch,
        setSelectedBranchId,
      }}
    >
      {children}
    </AdminBranchContext>
  );
};

export const useAdminBranchContext = () => {
  const context = useContext(AdminBranchContext);

  if (!context)
    throw new Error(
      "useAdminBranchContext must be use within AdminBranchProvider",
    );
  return context;
};
