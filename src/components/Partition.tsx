import { useState, useRef, useEffect, FC } from "react";
import {
  Partition as PartitionType,
  usePartition,
} from "../hooks/use-partition";

interface PartitionProps {
  partition: PartitionType;
}

export const Partition: FC<PartitionProps> = ({ partition }) => {
  const splitPartition = usePartition((state) => state.splitPartition);
  const removePartition = usePartition((state) => state.removePartition);
  const resizePartition = usePartition((state) => state.resizePartition);

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeRef.current && partition.children.length === 2) {
        const rect = resizeRef.current.getBoundingClientRect();
        const isVertical = partition.splitDirection === "vertical";
        const size = isVertical
          ? ((e.clientX - rect.left) / rect.width) * 100
          : ((e.clientY - rect.top) / rect.height) * 100;

        // Snapping
        const snapPoints = [25, 50, 75];
        const snapThreshold = 5;
        const snappedSize = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
        );

        const finalSize =
          Math.abs(snappedSize - size) < snapThreshold ? snappedSize : size;

        resizePartition(partition.children[0].id, finalSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, partition, resizePartition]);

  if (partition.children.length === 0) {
    return (
      <div
        className="w-full h-full relative"
        style={{
          backgroundColor: partition.color,
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 m-auto h-fit w-fit space-x-1">
          <button
            className="bg-white border border-black h-6 w-6 rounded-sm"
            onClick={() => splitPartition(partition.id, "vertical")}
          >
            v
          </button>
          <button
            className="bg-white border border-black h-6 w-6 rounded-sm"
            onClick={() => splitPartition(partition.id, "horizontal")}
          >
            h
          </button>
          <button
            className="bg-white border border-black h-6 w-6 rounded-sm"
            onClick={() => removePartition(partition.id)}
          >
            -
          </button>
        </div>
      </div>
    );
  }

  const [child1, child2] = partition.children;
  const isVertical = partition.splitDirection === "vertical";

  // FIX: return nothing to prevent ts screaming undefined
  if (!child1 || !child2) {
    return null;
  }

  return (
    <div
      ref={resizeRef}
      className={`flex w-full h-full ${isVertical ? "flex-row" : "flex-col"}`}
    >
      <div
        className="flex-grow-0 flex-shrink-0"
        style={{ flexBasis: `${child1.size || 50}%` }}
      >
        <Partition partition={child1} />
      </div>
      <div
        className={`bg-black ${
          isVertical
            ? "w-1 h-full cursor-col-resize"
            : "w-full h-1 cursor-row-resize"
        }`}
        onMouseDown={() => setIsResizing(true)}
      />
      <div style={{ flex: 1 }}>
        <Partition partition={child2} />
      </div>
    </div>
  );
};
