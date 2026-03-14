import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { BrowserRouter } from "react-router";
import { ClaimsProvider } from "../context/ClaimsContext.tsx";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ClaimsProvider>{children}</ClaimsProvider>
    </BrowserRouter>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
