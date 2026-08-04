"use client";

import { useSearchParams } from "next/navigation";
import { useBranch } from "@/hooks/api/useBranch";
import SectionHeader from "@/app/admin/components/SectionHeader";
import BranchForm from "../BranchForm";
import { FetchError } from "@/components/ui/FetchError";

const EditBranchPage = () => {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");

  const { data: branch, isLoading, isError, error } = useBranch(branchId);

  return (
    <div>
      <SectionHeader
        title={branch ? `Edit Branch: ${branch.name}` : "Edit Branch"}
        subTitle="Update branch details and delivery settings"
        breadcrumb={[
          {
            href: "/stores",
            name: "Stores",
          },
          {
            href: "/stores/edit",
            name: "Edit",
            className: "text-brand-color-500 hover:text-brand-color-600",
          },
        ]}
      />

      <div className="mt-6 max-w-2xl">
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        )}

        {isError && (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("Failed to load branch")
            }
            onRetry={() => window.location.reload()}
            description="Something went wrong while fetching the branch details."
          />
        )}
      </div>
      <div>{branch && <BranchForm branch={branch} />}</div>
    </div>
  );
};

export default EditBranchPage;
