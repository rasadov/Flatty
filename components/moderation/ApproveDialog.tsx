'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PROPERTY_RATINGS = ['A', 'B', 'B+', 'C', 'D'] as const;
type PropertyRating = typeof PROPERTY_RATINGS[number];

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: PropertyRating) => void;
  type: 'property' | 'complex';
}

export function ApproveDialog({ isOpen, onClose, onConfirm, type }: ApproveDialogProps) {
  const [selectedRating, setSelectedRating] = useState<PropertyRating>('B');

  const handleConfirm = () => {
    onConfirm(selectedRating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Approval</DialogTitle>
          <DialogDescription>
            Please select a rating for this {type} before approving.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={selectedRating}
            onValueChange={(value) => setSelectedRating(value as PropertyRating)}
            className="flex flex-col space-y-3"
          >
            {PROPERTY_RATINGS.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating} id={rating} />
                <Label htmlFor={rating} className="font-medium">
                  Rating {rating}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {getRatingDescription(rating)}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Approve with Rating {selectedRating}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getRatingDescription(rating: PropertyRating): string {
  const descriptions = {
    'A': 'Excellent condition, premium location',
    'B+': 'Very good condition, great location',
    'B': 'Good condition, good location',
    'C': 'Average condition, standard location',
    'D': 'Needs improvement, basic standards'
  };
  return descriptions[rating];
} 