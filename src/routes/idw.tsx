import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/idw")({
  component: () => <Outlet />,
});

