import { TaskFilter } from "@/lib/tasks";

type FilterControlsProps = {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  completedCount: number;
  onClearCompleted: () => void;
};

const FILTERS: Array<{ label: string; value: TaskFilter }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function FilterControls({
  activeFilter,
  onFilterChange,
  completedCount,
  onClearCompleted,
}: FilterControlsProps) {
  return (
    <div className="filter-row">
      <div
        className="filter-buttons"
        aria-label="Filter tasks"
        role="group"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            aria-pressed={activeFilter === filter.value}
            className="button"
            onClick={() => onFilterChange(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <button
        className="button button-danger"
        disabled={completedCount === 0}
        onClick={onClearCompleted}
        type="button"
      >
        Clear Completed
      </button>
    </div>
  );
}
