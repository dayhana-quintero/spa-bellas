import { expect, test as base, type Page } from "@playwright/test";

export const mobileViewport = {
  width: 390,
  height: 844,
  isMobile: true,
  hasTouch: true,
};

export const desktopViewport = {
  width: 1440,
  height: 1024,
};

type ViewportFixtures = {
  mobilePage: Page;
  desktopPage: Page;
};

export const test = base.extend<ViewportFixtures>({
  mobilePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: mobileViewport,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    try {
      await use(page);
    } finally {
      await context.close();
    }
  },

  desktopPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: desktopViewport,
    });
    const page = await context.newPage();

    try {
      await use(page);
    } finally {
      await context.close();
    }
  },
});

export { expect };
