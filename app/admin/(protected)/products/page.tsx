"use client";

import { useProducts } from "@/hooks/api/useProducts";
import ProductTable from "@/app/admin/components/ProductTable";
import SectionHeader from "@/app/admin/components/SectionHeader";
import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit,
    search: appliedSearch,
  });

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;

  const sortedProducts = [...products];

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Products Management"
        subTitle="Manage your restaurant's products"
      />

      <ProductTable
        products={sortedProducts}
        isProductLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <Pagination
        currentPage={pagination?.page ?? 1}
        totalPages={pagination?.totalPages ?? 1}
        total={pagination?.total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </section>
  );
};

export default ProductsPage;
