import { Loader } from "./animation/loading/Loader";

export function RoutePending() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#010102]">
      <Loader />
    </div>
  );
}
