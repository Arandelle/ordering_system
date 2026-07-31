// BranchManagement.tsx  — cleaned up
"use client";

import SectionHeader from "@/app/admin/components/SectionHeader";
import { InputField } from "@/components/ui/FormComponents/InputField";
import Modal from "@/components/ui/Modal";
import { StatCard, StatCardProps } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCard,
  TableCardHeader,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  TableToolbar,
} from "@/components/ui/table";
import { Branch, BranchFormData, BranchFormErrors } from "@/types/branch";
import { Ban, Loader2, Search } from "lucide-react";
import { useState } from "react";
import {
  formatBranchDataForForm,
  useBranches,
  useDeleteBranch,
  useToggleBranchStatus,
} from "@/hooks/api/useBranch";
import BranchModal from "./BranchModal";
import { IconButton } from "@/components/ui/buttons";
import { FetchError } from "@/components/ui/FetchError";

export const emptyForm: BranchFormData = {
  name: "",
  address: "",
  location: {
    latitude: "",
    longitude: "",
  },
  openingSoon: false,
  isBusy: false,
  maxActiveOrders: null,
  maxReservationsPerHour: null,
  maxReservationsPerDay: null,
};

export default function BranchManagement() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BranchFormData>(emptyForm);

  const [branchToUpdate, setBranchToUpdate] = useState<Branch | null>(null);

  const [errors, setErrors] = useState<BranchFormErrors>({});
  const [search, setSearch] = useState("");

  const { data: branches = [], isLoading, isError, error } = useBranches();

  const toggleStatus = useToggleBranchStatus();
  const deleteBranch = useDeleteBranch();

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpdateBranch = async (
    branch: Branch,
    type: "delete" | "edit" = "edit",
  ) => {
    setBranchToUpdate(branch);

    if (type === "edit") {
      // Use the conversion helper to transform API data to form data
      const formData = formatBranchDataForForm(branch);
      setForm(formData);
      setShowModal(true);
    } else {
      await deleteBranch.mutateAsync(branch._id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setBranchToUpdate(null);
    setForm(emptyForm);
    setErrors({});
  };

  const StoreHeaders = ["Branch", "Code", "Address", "Status", "Action"];

  return (
    <div>
      <SectionHeader
        title="Store Management"
        subTitle="Manage your store's branches"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {(
          [
            {
              label: "Total Branches",
              value: branches.length,
            },
            {
              label: "Active",
              value: branches.filter((b) => b.isActive).length,
            },
            {
              label: "Inactive",
              value: branches.filter((b) => !b.isActive).length,
            },
          ] as StatCardProps[]
        ).map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <TableCard>
        <TableCardHeader
          title="Recent Branches"
          actions={
            <IconButton
              onClick={() => {
                setShowModal(true);
                setErrors({});
                setForm(emptyForm);
              }}
              icon={{ name: "Plus" }}
              text="Add New Branch"
              className="px-4 rounded-lg"
            />
          }
        />

        <TableToolbar>
          <InputField
            placeholder="Search branches..."
            leftIcon={<Search size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-lg"
          />
        </TableToolbar>
        {isLoading ? (
          <TableSkeleton columns={StoreHeaders.length} headers={StoreHeaders} />
        ) : isError ? (
          <FetchError
            error={
              error instanceof Error
                ? error
                : new Error("Failed to load branches")
            }
            onRetry={() => window.location.reload()}
            description="Something went wrong while fetching the branches."
          />
        ) : filtered.length === 0 ? (
          <TableEmptyState
            icon="Ban"
            title="No branches found"
            description="Branches will be listed here"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {StoreHeaders.map((h) => (
                  <TableHead key={h} className="text-center">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((branch) => (
                <TableRow
                  key={branch._id}
                  className="bg-transparent hover:bg-gray-100 border-gray-100"
                >
                  <TableCell className="capitalize">{branch.name}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-gray-500 py-1 px-2.5 rounded-md text-white text-nowrap">
                      {branch.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>{branch.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold py-1.5 px-3 rounded-lg text-white ${branch.isActive ? "bg-dark-green-500" : "bg-red-600"}`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                      {branch.openingSoon && (
                        <span className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-amber-500 text-white">
                          Opening Soon
                        </span>
                      )}
                      {branch.isBusy && (
                        <span className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-orange-600 text-white">
                          Busy
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <IconButton
                        onClick={() => handleUpdateBranch(branch, "edit")}
                        variant="success"
                        text="Edit"
                        className="text-xs rounded-lg px-4"
                      />
                      <IconButton
                        onClick={() => toggleStatus.mutate(branch._id)}
                        disabled={toggleStatus.isPending}
                        variant={branch.isActive ? "outline" : "primary"}
                        text={branch.isActive ? "Deactivate" : "Activate"}
                        className="px-4 rounded-lg text-xs"
                      />
                      {!branch.isActive && (
                        <IconButton
                          onClick={() => handleUpdateBranch(branch, "delete")}
                          disabled={toggleStatus.isPending}
                          variant="danger"
                          text="Delete"
                          className="px-4 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      {/* Modal */}
      {showModal && (
        <Modal
          title={
            branchToUpdate
              ? `Edit Branch: ${branchToUpdate.name}`
              : "Add New Branch"
          }
          onClose={handleCloseModal}
        >
          <BranchModal
            branchToUpdate={branchToUpdate}
            setBranchToUpdate={setBranchToUpdate}
            setShowModal={setShowModal}
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
          />
        </Modal>
      )}
    </div>
  );
}
