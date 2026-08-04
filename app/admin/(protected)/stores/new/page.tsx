import SectionHeader from "@/app/admin/components/SectionHeader";
import BranchForm from "../BranchForm";

const NewBranchPage = () => {
  return (
    <div>
      <SectionHeader
        title="Create New Store Branch"
        subTitle="Expand your business by creating a new branch"
        breadcrumb={[
          {
            href: "/stores",
            name: "Stores",
          },
          {
            href: "/stores/new",
            name: "New Store",
            className: "text-brand-color-500 hover:text-brand-color-600",
          },
        ]}
      />

      <div className="max-w-400">
        <BranchForm />
      </div>
    </div>
  );
};

export default NewBranchPage;
