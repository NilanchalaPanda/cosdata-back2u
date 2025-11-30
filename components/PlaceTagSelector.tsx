import {
  Building2,
  GraduationCap,
  ShoppingBag,
  Building,
  Landmark,
  Hospital,
} from "lucide-react";

const placeTags = [
  {
    id: "college",
    label: "College Campus",
    icon: GraduationCap,
  },
  {
    id: "mall",
    label: "Shopping Mall",
    icon: ShoppingBag,
  },
  {
    id: "office",
    label: "Office Building",
    icon: Building2,
  },
  {
    id: "hospital",
    label: "Hospital",
    icon: Hospital,
  },
  { id: "library", label: "Library", icon: Building, color: "var(--warning)" },
  {
    id: "government",
    label: "Govt. Office",
    icon: Landmark,
  },
];

interface PlaceTagSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

const PlaceTagSelector = ({ selected, onSelect }: PlaceTagSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {placeTags.map(({ id, label, icon: Icon }) => {
        const isSelected = selected === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition
              ${
                isSelected
                  ? "border-(--primary) bg-(--primary-bg) shadow-md"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-(--primary)"
              }`}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: isSelected ? "var(--primary)" : undefined }}
            />

            <span
              className={`text-xs font-medium text-center
                ${isSelected ? "text-(--primary)" : "text-gray-600"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PlaceTagSelector;
