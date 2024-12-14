import { create } from "zustand";
import { generateId, generateRandomColor } from "../utils/helpers";

export interface Partition {
  id: string;
  color: string;
  children: Partition[];
  splitDirection?: "vertical" | "horizontal";
  size?: number;
}

interface PartitionStore {
  rootPartition: Partition;
  splitPartition: (id: string, direction: "vertical" | "horizontal") => void;
  removePartition: (id: string) => void;
  resizePartition: (id: string, size: number) => void;
}

const createPartition = (): Partition => ({
  id: generateId(9),
  color: generateRandomColor(),
  children: [],
});

export const usePartition = create<PartitionStore>((set) => ({
  rootPartition: createPartition(),
  splitPartition: (id, direction) =>
    set((state) => {
      const splitPartitionRecursive = (partition: Partition): Partition => {
        if (partition.id === id) {
          return {
            ...partition,
            splitDirection: direction,
            children: [
              { ...partition, id: generateId(9), children: [] },
              createPartition(),
            ],
          };
        }
        return {
          ...partition,
          children: partition.children.map(splitPartitionRecursive),
        };
      };
      return { rootPartition: splitPartitionRecursive(state.rootPartition) };
    }),
  removePartition: (id) =>
    set((state) => {
      const removePartitionRecursive = (
        partition: Partition
      ): Partition | null => {
        if (partition.children.length === 2) {
          const [child1, child2] = partition.children;
          if (child1.id === id) return child2;
          if (child2.id === id) return child1;
        }
        return {
          ...partition,
          children: partition.children
            .map(removePartitionRecursive)
            .filter((child): child is Partition => child !== null),
        };
      };
      const newRootPartition = removePartitionRecursive(state.rootPartition);
      return { rootPartition: newRootPartition || createPartition() };
    }),
  resizePartition: (id, size) =>
    set((state) => {
      const resizePartitionRecursive = (partition: Partition): Partition => {
        if (partition.children.length === 2) {
          const [child1, child2] = partition.children;
          if (child1.id === id) {
            return { ...partition, children: [{ ...child1, size }, child2] };
          }
          if (child2.id === id) {
            return { ...partition, children: [child1, { ...child2, size }] };
          }
        }
        return {
          ...partition,
          children: partition.children.map(resizePartitionRecursive),
        };
      };
      return { rootPartition: resizePartitionRecursive(state.rootPartition) };
    }),
}));
