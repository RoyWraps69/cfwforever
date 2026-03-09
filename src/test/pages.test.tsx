import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe("Index Page", () => {
  it("renders the iframe with correct src", () => {
    renderWithProviders(<Index />);
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute("src")).toBe("/site.html");
    expect(iframe?.getAttribute("title")).toBe("Chicago Fleet Wraps");
  });

  it("iframe has no border and fills viewport", () => {
    renderWithProviders(<Index />);
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.style.display).toBe("block");
  });
});

describe("NotFound Page", () => {
  it("renders 404 content", () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});