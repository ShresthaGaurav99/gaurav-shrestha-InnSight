import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "InnSight" },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = auth.get();
    if (!session) {
      navigate({ to: "/auth", replace: true });
    } else {
      navigate({ to: auth.routeFor(session.role) as any, replace: true });
    }
  }, [navigate]);

  // Render a blank screen or a loading spinner while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
