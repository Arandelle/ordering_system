import { SelectField } from "@/components/ui/FormComponents";
import {
  RATING_FILTER_OPTIONS,
  ratingFilterType,
  VISIBILITY_FILTER_OPTIONS,
  visibilityFilterType,
} from "../review.constant";
import { SearchBar } from "@/components/ui/SearchBar";
import { useReviewFilters } from "../hooks/useReviewFilter";

type ReviewFilterProps = {
  filters: ReturnType<typeof useReviewFilters>;
};

// components
const ReviewFilter = ({ filters }: ReviewFilterProps) => {
  const {
    ratingFilter,
    setRatingFilter,
    visibilityFilter,
    setVisibilityFilter,
    searchQuery,
    setSearchQuery,
    jumpToPage,
    handleSearch,
  } = filters;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_3fr] gap-4">
      <SelectField
        label="Filter by rating"
        options={RATING_FILTER_OPTIONS.map((option) => ({
          label: option.label,
          value: option.key,
        }))}
        value={ratingFilter}
        onChange={(e) => {
          setRatingFilter(e.target.value as ratingFilterType);
          jumpToPage(1);
        }}
      />
      <SelectField
        label="Filter by visibility"
        options={VISIBILITY_FILTER_OPTIONS.map((option) => ({
          label: option.label,
          value: option.key,
        }))}
        value={visibilityFilter}
        onChange={(e) => {
          setVisibilityFilter(e.target.value as visibilityFilterType);
          jumpToPage(1);
        }}
      />
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        placeholder="Search reviews by comment..."
      />
    </div>
  );
};

export default ReviewFilter;
