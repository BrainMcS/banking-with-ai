import Image from "next/image";

import { topCategoryStyles } from "@/constants";
import { cn } from "@/lib/utils";

import { Progress } from "./ui/progress";

const Category = ({ category }: CategoryProps) => {
  const {
    bg,
    circleBg,
    text: { main, count },
    progress: { bg: progressBg, indicator },
    icon,
  } = topCategoryStyles[category.name as keyof typeof topCategoryStyles] ||
  topCategoryStyles.default;

  return (
    <div className={cn("gap-[18px] flex p-4 rounded-xl dark:bg-dark-card", bg)}>
      <figure className={cn("flex-center size-10 rounded-full dark:bg-dark-muted", circleBg)}>
        <Image 
          src={icon} 
          width={20} 
          height={20} 
          alt={category.name}
          className="dark:invert" 
        />
      </figure>
      <div className="flex w-full flex-1 flex-col gap-2">
        <div className="text-14 flex justify-between">
          <h2 className={cn("font-medium dark:text-white", main)}>{category.name}</h2>
          <h3 className={cn("font-normal dark:text-gray-200", count)}>{category.count}</h3>
        </div>
        <Progress
          value={(category.count / category.totalCount) * 100}
          className={cn("h-2 w-full dark:bg-dark-muted", progressBg)}
          indicatorClassName={cn("h-2 w-full dark:opacity-80 dark:invert", indicator)}
        />
      </div>
    </div>
  );
};

export default Category;