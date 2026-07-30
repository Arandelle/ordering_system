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

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [popularityFilter, setPopularityFilter] = useState("all");

  // Sort state
  const [sortOption, setSortOption] = useState("default");

  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit,
    search: appliedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    productType: typeFilter === "all" ? undefined : typeFilter,
    isPopular:
      popularityFilter === "all"
        ? undefined
        : popularityFilter === "popular"
          ? "true"
          : "false",
    sort: sortOption === "default" ? undefined : sortOption,
  });

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  // Each filter/sort change also resets to page 1
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };
  const handlePopularityFilterChange = (value: string) => {
    setPopularityFilter(value);
    setPage(1);
  };
  const handleSortOptionChange = (value: string) => {
    setSortOption(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPopularityFilter("all");
    setSortOption("default");
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Products Management"
        subTitle="Manage your restaurant's products"
      />

      <ProductTable
        products={products}
        isProductLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        popularityFilter={popularityFilter}
        onPopularityFilterChange={handlePopularityFilterChange}
        sortOption={sortOption}
        onSortOptionChange={handleSortOptionChange}
        onResetFilters={handleResetFilters}
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
