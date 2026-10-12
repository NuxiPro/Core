import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import LoginForm from "@/src/features/auth/components/LoginForm";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    window.dispatchEvent(new Event("app-ready"));
  }, []);

  return <LoginForm />;
}
