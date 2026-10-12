import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardScrollContainer } from "../BoardScrollContainer";

// requestAnimationFrame est synchrone dans jsdom mais certaines versions
// reportent l'exécution au prochain tick. On le rend synchrone pour la stabilité.
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BoardScrollContainer", () => {
  it("rend les enfants dans la zone scrollable", () => {
    render(
      <BoardScrollContainer>
        <div data-testid="child-1">Colonne A</div>
        <div data-testid="child-2">Colonne B</div>
      </BoardScrollContainer>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(
      screen.getByRole("region", {
        name: /horizontally scrollable task board/i,
      }),
    ).toBeInTheDocument();
  });

  it("ne montre pas les flèches par défaut quand le contenu tient dans le viewport", () => {
    render(
      <BoardScrollContainer>
        <div>Colonne unique</div>
      </BoardScrollContainer>,
    );

    expect(
      screen.queryByRole("button", { name: /scroll board left/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /scroll board right/i }),
    ).not.toBeInTheDocument();
  });

  it("affiche la flèche droite et appelle scrollBy(+360) quand on scrolle à droite", async () => {
    // Mock les dimensions du container pour simuler un overflow
    const scrollByMock = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollBy",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      writable: true,
      value: scrollByMock,
    });

    // Mock scrollWidth > clientWidth pour faire apparaître canScrollRight
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get: () => 2000,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 500,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
      configurable: true,
      get: () => 0,
      set: () => {},
    });

    render(
      <BoardScrollContainer>
        <div>Colonne 1</div>
        <div>Colonne 2</div>
      </BoardScrollContainer>,
    );

    const rightButton = await screen.findByRole("button", {
      name: /scroll board right/i,
    });
    expect(rightButton).toBeInTheDocument();

    fireEvent.click(rightButton);

    expect(scrollByMock).toHaveBeenCalledWith({
      left: 360,
      behavior: "smooth",
    });

    // Cleanup
    if (originalDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollBy",
        originalDescriptor,
      );
    } else {
      // @ts-expect-error - reset
      delete HTMLElement.prototype.scrollBy;
    }
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .scrollWidth;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .clientWidth;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .scrollLeft;
  });

  it("enregistre et nettoie le listener 'resize' sur window (cleanup à l'unmount)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <BoardScrollContainer>
        <div>Colonne 1</div>
      </BoardScrollContainer>,
    );

    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    const addCalls = addSpy.mock.calls.filter((c) => c[0] === "resize");
    expect(addCalls.length).toBeGreaterThanOrEqual(1);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("n'active plus le drag-to-scroll manuel (automatisé en scroll natif)", () => {
    let currentScrollLeft = 0;
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get: () => 2000,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 500,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
      configurable: true,
      get: () => currentScrollLeft,
      set: (v: number) => {
        currentScrollLeft = v;
      },
    });

    const { container } = render(
      <BoardScrollContainer>
        <div>Colonne 1</div>
      </BoardScrollContainer>,
    );
    const region = container.querySelector(
      "[aria-label='Horizontally scrollable task board']",
    ) as HTMLDivElement;
    fireEvent.mouseDown(region, { clientX: 200 });
    fireEvent.mouseMove(region, { clientX: 150 });
    expect(currentScrollLeft).toBe(0);

    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .scrollWidth;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .clientWidth;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .scrollLeft;
  });
});
