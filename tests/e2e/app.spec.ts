import { test, expect } from '@playwright/test';

test.describe('VuCar Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should display the homepage', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/VuCar/);
    
    // Check for main navigation or content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to cars page', async ({ page }) => {
    // Navigate to cars page
    await page.click('a[href="/cars"]');
    
    // Check if we're on the cars page
    await expect(page).toHaveURL(/.*cars/);
    await expect(page.locator('h1')).toContainText(/cars/i);
  });

  test('should navigate to criteria page', async ({ page }) => {
    // Navigate to criteria page
    await page.click('a[href="/criteria"]');
    
    // Check if we're on the criteria page
    await expect(page).toHaveURL(/.*criteria/);
    await expect(page.locator('h1')).toContainText(/criteria/i);
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API health check', async ({ page }) => {
    // Test API health endpoint
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('OK');
  });
});