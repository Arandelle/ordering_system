export const getBranchQuery = (selectedBranchId: string) =>
  selectedBranchId === "all"
    ? ""
    : `?branchId=${encodeURIComponent(selectedBranchId)}`;
