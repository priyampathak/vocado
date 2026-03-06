"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Curated list of fun/doodle-style icons
const ICON_LIST = [
  "Smile",
  "Heart",
  "Star",
  "Zap",
  "Flame",
  "Sparkles",
  "Sun",
  "Moon",
  "Cloud",
  "Umbrella",
  "Coffee",
  "Pizza",
  "IceCream",
  "Cake",
  "Cherry",
  "Apple",
  "Leaf",
  "Trees",
  "Flower",
  "Palmtree",
  "Music",
  "Headphones",
  "Mic",
  "Radio",
  "Tv",
  "Camera",
  "Film",
  "Image",
  "Palette",
  "Brush",
  "Pen",
  "BookOpen",
  "Book",
  "Library",
  "Newspaper",
  "Mail",
  "Send",
  "MessageCircle",
  "Phone",
  "Video",
  "Rocket",
  "Plane",
  "Car",
  "Bike",
  "Train",
  "Ship",
  "Anchor",
  "Globe",
  "MapPin",
  "Compass",
  "Navigation",
  "Target",
  "Award",
  "Trophy",
  "Medal",
  "Gift",
  "PartyPopper",
  "Lightbulb",
  "Bomb",
  "Bug",
  "Atom",
  "Dna",
  "Microscope",
  "Telescope",
  "Puzzle",
  "Gamepad2",
  "Dices",
  "Sword",
  "Wand2",
  "Crown",
  "Diamond",
  "Gem",
  "Key",
  "Lock",
  "Unlock",
  "Shield",
  "Eye",
  "Brain",
  "Fingerprint",
  "Scan",
  "SearchCheck",
  "Briefcase",
  "Folder",
  "FolderOpen",
  "FileText",
  "FileCode",
  "Code2",
  "Terminal",
  "Cpu",
  "HardDrive",
  "Database",
  "Server",
  "Wifi",
  "Signal",
  "Bluetooth",
  "Boxes",
  "Package",
  "ShoppingCart",
  "Store",
  "Home",
  "Building",
  "Factory",
  "Landmark",
  "Church",
  "School",
  "GraduationCap",
  "Users",
  "UserCheck",
  "Handshake",
  "ThumbsUp",
  "ThumbsDown",
  "TrendingUp",
  "TrendingDown",
  "Activity",
  "PieChart",
  "BarChart3",
  "LineChart",
  "Percent",
  "DollarSign",
  "CreditCard",
  "Wallet",
  "BadgeDollarSign",
  "Calculator",
  "Calendar",
  "Clock",
  "Timer",
  "Hourglass",
  "Bell",
  "BellRing",
  "Megaphone",
  "Volume2",
  "Flag",
  "Bookmark",
  "Tag",
  "Paperclip",
  "Link",
  "Share2",
  "Download",
  "Upload",
  "CloudUpload",
  "CloudDownload",
  "Settings",
  "Wrench",
  "Hammer",
  "Scissors",
  "Ruler",
  "Trash2",
  "Archive",
];

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
}

export function IconPicker({
  open,
  onOpenChange,
  onSelectIcon,
  currentIcon,
}: IconPickerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    if (!searchQuery) return ICON_LIST;
    return ICON_LIST.filter((icon) =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          
          <ScrollArea className="h-[400px] w-full">
            <div className="grid grid-cols-8 gap-2 p-2">
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                if (!Icon) return null;
                
                const isSelected = currentIcon === iconName;
                
                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelectIcon(iconName)}
                    className={cn(
                      "p-3 rounded-lg border-2 hover:bg-accent hover:border-primary transition-all flex items-center justify-center",
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "border-transparent bg-muted/50"
                    )}
                    title={iconName}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
