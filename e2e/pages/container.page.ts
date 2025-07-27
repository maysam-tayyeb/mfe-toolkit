import { Page, Locator } from '@playwright/test';

export class ContainerPage {
  readonly page: Page;
  readonly navHome: Locator;
  readonly navDashboard: Locator;
  readonly navExampleMFE: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navHome = page.locator('nav').getByRole('link', { name: 'Home' });
    this.navDashboard = page.locator('nav').getByRole('link', { name: 'Dashboard' });
    this.navExampleMFE = page.locator('nav').getByRole('link', { name: 'Example MFE' });
    this.pageTitle = page.getByRole('heading', { level: 1 });
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToHome() {
    await this.navHome.click();
  }

  async navigateToDashboard() {
    await this.navDashboard.click();
  }

  async navigateToExampleMFE() {
    await this.navExampleMFE.click();
  }

  async waitForMFEToLoad() {
    // Wait for MFE content to be visible
    await this.page.waitForSelector('[data-testid="mfe-content"]', {
      state: 'visible',
      timeout: 10000,
    });
  }
}
