import { Partition } from "./components/Partition";
import { usePartition } from "./hooks/use-partition";

export default function App() {
  const rootPartition = usePartition((state) => state.rootPartition);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Partition partition={rootPartition} />
    </div>
  );
}
