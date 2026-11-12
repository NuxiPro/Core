import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsNavigation } from "../SettingsNavigation";

describe("SettingsNavigation", () => {
  it("renders all available settings tabs", () => {
    render(
      <SettingsNavigation activeTab="general" onTabChange={vi.fn()} />,
    );

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Account & Security")).toBeInTheDocument();
    expect(screen.getByText("Archiving & Auto")).toBeInTheDocument();
  });

  it("marks the active tab and notifies tab changes", () => {
    const onTabChange = vi.fn();
    render(
      <SettingsNavigation activeTab="general" onTabChange={onTabChange} />,
    );

    const generalTab = screen.getByRole("button", { name: /General$/ });
    const profileTab = screen.getByRole("button", {
      name: /Account & Security$/,
    });

    expect(generalTab).toHaveAttribute("data-tab", "general");
    expect(generalTab.className).toContain("border-emerald-500");

    fireEvent.click(profileTab);

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("profile");
  });
});
