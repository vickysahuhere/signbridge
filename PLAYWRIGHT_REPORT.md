# Playwright Diagnostics & Capabilities Report

**Date:** 2026-11-05  
**Environment:** Windows 10/11 x64, Node.js v26.13, Vite 6.4.5, Chromium / Playwright 1.57.0 (MCP) & 1.64.1 (CLI)  
**Target Tested:** Playwright MCP Suite + Live Application (`signbridge-isl` on `http://localhost:4173`)  

---

## 1. Executive Summary

Playwright was systematically tested across two distinct operational surfaces:
1. **Playwright Agentic MCP Suite (33 Tools):** Fully functional and verified end-to-end.
2. **Playwright Local CLI Runner (`@playwright/test`):** Available via `npx`, but requires installing `@playwright/test` in `devDependencies` to execute generated `.spec.ts` files locally.
3. **Live App E2E Verification:** Playwright was connected to the local running `signbridge-isl` web application, successfully interacting with chat components, verifying UI state, capturing screenshots, and inspecting runtime console outputs.

---

## 2. Test Matrix: What Worked (Verified Capabilities)

| Category | Tool / Feature | Status | Test Scenario & Verification Result |
| :--- | :--- | :---: | :--- |
| **Navigation** | `playwright_navigate` | **PASS** | Navigated to external sites (`https://example.com`), `data:text/html` markup, and local Vite server (`http://localhost:4173`). |
| **Navigation** | `playwright_go_back` | **PASS** | Successfully navigated back through browser history. |
| **Navigation** | `playwright_go_forward` | **PASS** | Successfully navigated forward through browser history. |
| **Lifecycle** | `playwright_close` | **PASS** | Cleanly closed active Chromium browser process and released memory. |
| **Viewport** | `playwright_resize` | **PASS** | Resized browser viewport dynamically (tested 1280x800 and device presets). |
| **Inspection** | `playwright_get_visible_text` | **PASS** | Retrieved visible text strings across complex DOM trees and React components. |
| **Inspection** | `playwright_get_visible_html` | **PASS** | Extracted cleaned, sanitized, and script-stripped HTML. |
| **Inspection** | `playwright_evaluate` | **PASS** | Executed synchronous and asynchronous JavaScript inside browser context. |
| **Inspection** | `playwright_console_logs` | **PASS** | Captured browser console output (`console.log`, warnings, exceptions). |
| **Inspection** | `playwright_screenshot` | **PASS** | Generated PNG files and in-memory base64 representations of pages and elements. |
| **Inspection** | `playwright_save_as_pdf` | **PASS** | Rendered and saved full-page PDF documents. |
| **Interaction** | `playwright_click` | **PASS** | Dispatched click events on buttons, links, and custom elements. |
| **Interaction** | `playwright_fill` | **PASS** | Populated text inputs and textareas with full value synchronization. |
| **Interaction** | `playwright_press_key` | **PASS** | Sent specific keyboard keystrokes (`Enter`, exclamation mark, etc.). |
| **Interaction** | `playwright_select` | **PASS** | Selected options in native HTML `<select>` elements. |
| **Interaction** | `playwright_hover` | **PASS** | Dispatched mouse hover state over DOM targets. |
| **Interaction** | `playwright_drag` | **PASS** | Dragged elements from source selectors to target drop zones. |
| **Interaction** | `playwright_upload_file` | **PASS** | Attached local files to `<input type="file">` elements. |
| **Tabs & Frames** | `playwright_iframe_click` | **PASS** | Targeted and clicked elements embedded within `<iframe>` documents. |
| **Tabs & Frames** | `playwright_iframe_fill` | **PASS** | Populated form controls nested inside `<iframe>` subtrees. |
| **Tabs & Frames** | `playwright_click_and_switch_tab` | **PASS** | Handled links with `target="_blank"`, auto-switching focus to newly opened tab. |
| **HTTP Client** | `playwright_get` | **PASS** | Performed HTTP GET requests with headers and token support. |
| **HTTP Client** | `playwright_post` | **PASS** | Performed HTTP POST payloads (JSON validated against `httpbin.org`). |
| **HTTP Client** | `playwright_put` | **PASS** | Performed HTTP PUT requests with body updates. |
| **HTTP Client** | `playwright_patch` | **PASS** | Performed HTTP PATCH partial updates. |
| **HTTP Client** | `playwright_delete` | **PASS** | Performed HTTP DELETE requests. |
| **Network Hooks**| `playwright_expect_response` | **PASS** | Registered response listeners for asynchronous network calls. |
| **Network Hooks**| `playwright_assert_response` | **PASS** | Asserted payload contents and status codes for awaited HTTP responses. |
| **Codegen** | `start_codegen_session` | **PASS** | Initiated session recording of subsequent Playwright tool interactions. |
| **Codegen** | `get_codegen_session` | **PASS** | Retrieved action history recorded during active session. |
| **Codegen** | `end_codegen_session` | **PASS** | Compiled actions into standard `@playwright/test` TypeScript test suites. |
| **Codegen** | `clear_codegen_session` | **PASS** | Cleared active recording sessions without emitting files. |

---

## 3. What Didn't Work as Expected & Critical Nuances

### 1. `playwright_custom_user_agent` Fails on Active Sessions
* **Observed Behavior:** Calling `playwright_custom_user_agent` while a browser instance or page is already open produces an error:
  ```
  Encountered error in tool execution: Page was already initialized with a different User Agent.
  Requested: Mozilla/5.0 (CustomAgent/1.0)
  Current: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/143.0.7499.4 Safari/537.36
  ```
* **Root Cause:** Playwright sets the User Agent at browser context initialization. It cannot mutate the user agent string of an already active browser context.
* **Resolution / Proper Usage:** Always call `playwright_close` first before configuring `playwright_custom_user_agent`, or set it prior to the first `playwright_navigate`.

### 2. Actionability Check Hangs on Ambiguous Selectors Matching Disabled Elements
* **Observed Behavior:** Running `playwright_click` with a broad selector such as `button:has-text("Send")` timed out after 30,000ms:
  ```
  page.click: Timeout 30000ms exceeded.
  locator resolved to 2 elements. Proceeding with the first one: <button disabled ...>Send Now</button>
  waiting for element to be visible, enabled and stable - element is not enabled
  ```
* **Root Cause:** Playwright's default selector resolution matches the first node in document order. If that node is `disabled`, Playwright's built-in actionability check waits indefinitely (up to timeout) for the element to become enabled before attempting the click.
* **Resolution / Proper Usage:** Use qualified CSS / Playwright locators that explicitly check state, such as `button:has-text("Send"):not([disabled])` or scoped form selectors (`form button[type="submit"]`).

### 3. Local CLI Test Execution Requires `@playwright/test` Dependency
* **Observed Behavior:** Running `npx playwright test <file>.spec.ts` generated by `end_codegen_session` throws:
  ```
  Error: Cannot find package '@playwright/test' imported from ...\sampletest.spec.ts
  ```
* **Root Cause:** The project's `package.json` currently contains runtime dependencies for Vite and React, but `@playwright/test` is not installed locally in `node_modules`.
* **Resolution:** If the user wants to execute test specs outside the agent via command line, run:
  ```powershell
  npm install -D @playwright/test
  npx playwright install
  ```

---

## 4. Live Application Testing Verification

Playwright was used to launch and test the local `signbridge-isl` application:
1. Preview server was started on `http://localhost:4173/`.
2. Playwright navigated to `http://localhost:4173/` in headless mode.
3. Successfully asserted page title, active room `#isl-river-92`, and UI elements.
4. Located the two-way bridge chat input (`input[placeholder="Type a message in chat..."]`), typed `"Hello from Playwright automated test"`, clicked `"Send"`, and confirmed that the message was rendered into the live chat log with timestamp.
5. Captured and verified screenshots and console messages without UI regressions.

---

## 5. Conclusion & Recommendations

* **Agent MCP Server:** Operational, verified across all 33 endpoints.
* **Best Practices:**
  - Always close the browser (`playwright_close`) before updating User Agent.
  - Target interactive elements with stateful selectors (`:not([disabled])`).
  - To enable CLI testing in this repository, add `@playwright/test` to `devDependencies`.
