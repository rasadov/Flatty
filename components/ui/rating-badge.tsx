import { cn } from "@/lib/utils";

type PropertyRating = 'A' | 'B' | 'B+' | 'C' | 'D';

interface RatingBadgeProps {
  rating: PropertyRating;
  className?: string;
}

const ratingColors = {
  'A': 'bg-green-100 text-green-800 border-green-200',
  'B+': 'bg-blue-100 text-blue-800 border-blue-200',
  'B': 'bg-blue-50 text-blue-700 border-blue-100',
  'C': 'bg-orange-100 text-orange-800 border-orange-200',
  'D': 'bg-red-100 text-red-800 border-red-200',
} as const;

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
      ratingColors[rating],
      className
    )}>
      Rating {rating}
    </span>
  );
} 