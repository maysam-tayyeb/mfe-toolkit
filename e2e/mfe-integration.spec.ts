import { test, expect } from '@playwright/test';

test.describe('MFE Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('http://localhost:3000');
  });

  test('should navigate to MFE and interact with services', async ({ page }) => {
    // Check home page loads
    await expect(page.locator('h1')).toContainText('Welcome to MFE Platform');
    
    // Navigate to Example MFE
    await page.click('text=Example MFE');
    
    // Wait for MFE to load
    await expect(page.locator('h1')).toContainText('MFE Service Explorer');
    
    // Test Modal Service
    await page.click('text=Simple Modal');
    await expect(page.locator('text=Simple Modal Example')).toBeVisible();
    await page.click('button[aria-label="Close"]');
    
    // Test Notification Service
    await page.click('text=success');
    await expect(page.locator('text=Success Notification')).toBeVisible();
    
    // Test Event Bus
    await page.fill('input[placeholder="Event name"]', 'TEST_EVENT');
    await page.fill('textarea[placeholder*="Event data"]', '{"test": "e2e"}');
    await page.click('text=Send Event');
    
    // Check event appears in log
    await expect(page.locator('text=TEST_EVENT')).toBeVisible();
    
    // Test Auth Service
    await page.click('text=View Session Details');
    await expect(page.locator('text=Session Information')).toBeVisible();
  });

  test('should handle navigation between container and MFE', async ({ page }) => {
    // Navigate to Dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('h1')).toContainText('Platform Dashboard');
    
    // Navigate to MFE
    await page.click('text=Example MFE');
    await expect(page.locator('h1')).toContainText('MFE Service Explorer');
    
    // Go back to home
    await page.click('a[href="/"]');
    await expect(page.locator('h1')).toContainText('Welcome to MFE Platform');
  });

  test('should persist state between navigations', async ({ page }) => {
    // Navigate to MFE
    await page.click('text=Example MFE');
    
    // Send a custom event
    await page.fill('input[placeholder="Event name"]', 'PERSIST_TEST');
    await page.click('text=Send Event');
    
    // Navigate away and back
    await page.click('text=Dashboard');
    await page.click('text=Example MFE');
    
    // Event log should still contain the event
    await expect(page.locator('text=PERSIST_TEST')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to navigate to non-existent MFE
    await page.goto('http://localhost:3000/mfe/non-existent');
    
    // Should show error or fallback
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigation should be responsive
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigate to MFE
    await page.goto('http://localhost:3000/mfe/example');
    
    // MFE should be responsive
    await expect(page.locator('h1')).toContainText('MFE Service Explorer');
    
    // Service cards should stack on mobile
    const modalService = page.locator('text=Modal Service').locator('..');
    await expect(modalService).toBeVisible();
  });
});