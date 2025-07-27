import { test, expect } from '@playwright/test';
import { ContainerPage } from '../pages/container.page';

test.describe('MFE Loading', () => {
  let containerPage: ContainerPage;

  test.beforeEach(async ({ page }) => {
    containerPage = new ContainerPage(page);
    await containerPage.goto();
  });

  test('should load container app with navigation', async ({ page }) => {
    // Check that navigation is visible
    await expect(containerPage.navHome).toBeVisible();
    await expect(containerPage.navDashboard).toBeVisible();
    await expect(containerPage.navExampleMFE).toBeVisible();

    // Check home page is loaded by default
    await expect(page).toHaveURL('/');
    await expect(containerPage.pageTitle).toContainText('Welcome to MFE Container');
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to Dashboard
    await containerPage.navigateToDashboard();
    await expect(page).toHaveURL('/dashboard');
    await expect(containerPage.pageTitle).toContainText('Dashboard');

    // Navigate back to Home
    await containerPage.navigateToHome();
    await expect(page).toHaveURL('/');
    await expect(containerPage.pageTitle).toContainText('Welcome to MFE Container');
  });

  test('should load Example MFE', async ({ page }) => {
    // Navigate to Example MFE
    await containerPage.navigateToExampleMFE();
    await expect(page).toHaveURL('/mfe/example');

    // Wait for MFE to load
    await containerPage.waitForMFEToLoad();

    // Check MFE content is displayed
    const mfeContent = page.locator('[data-testid="mfe-content"]');
    await expect(mfeContent).toBeVisible();
    await expect(mfeContent).toContainText('Example MFE');
  });

  test('should handle MFE service interactions', async ({ page }) => {
    // Navigate to Example MFE
    await containerPage.navigateToExampleMFE();
    await containerPage.waitForMFEToLoad();

    // Test modal service
    const openModalButton = page.getByRole('button', { name: 'Open Modal' });
    await openModalButton.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // Test notification service
    const showNotificationButton = page.getByRole('button', { name: 'Show Success' });
    await showNotificationButton.click();

    const notification = page.locator('[role="alert"]');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('Success');
  });

  test('should handle MFE loading errors gracefully', async ({ page }) => {
    // Navigate to non-existent MFE
    await page.goto('/mfe/non-existent');

    // Should show error message
    const errorMessage = page.locator('[data-testid="mfe-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to load MFE');
  });
});
