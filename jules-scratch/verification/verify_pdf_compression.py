from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the application
        page.goto("http://localhost:5173")

        # 2. Click on the PDF Compression tab
        pdf_tab_button = page.get_by_role("button", name="PDF Compression")
        pdf_tab_button.click()

        # 3. Upload the sample PDF file
        # Use set_input_files to upload the file to the hidden input element
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files("jules-scratch/verification/sample.pdf")

        # 4. Click the "Compress PDF" button
        compress_button = page.get_by_role("button", name="Compress PDF")
        compress_button.click()

        # 5. Wait for the compression to complete and the download link to appear
        download_button = page.get_by_role("link", name="Download PDF")
        expect(download_button).to_be_visible(timeout=30000) # Increased timeout for compression

        # 6. Take a screenshot of the result
        page.screenshot(path="jules-scratch/verification/pdf_compression_result.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)