# Orlando Health Form Name Reader

A Chrome extension that reads and copies the **Form Name** and **Form ID** from
Orlando Health FormAssembly (tfaforms.net) forms.

**Current version:** 1.3.0

---

## Overview

Orlando Health forms hosted on FormAssembly include two hidden fields,
`Form Name` and `Form ID`, that are useful when triaging support requests or
linking form submissions back to their source form. They aren't visible in the
form UI, so finding them normally means opening DevTools.

This extension surfaces both values in a small popup with click-to-copy fields,
in the style of 1Password's autofill chips.

It works on:

- Direct `tfaforms.net` form pages
- Forms embedded via iframe in another page (e.g. SharePoint)

## Features

- Reads the hidden `Form Name` and `Form ID` fields from any Orlando Health
  FormAssembly form
- Click-to-copy chips for each field, with brief "Copied!" feedback
- Detects iframe-embedded forms so it works inside SharePoint and similar hosts
- Partial-result handling: if only one of the two fields is present, the
  available field is still shown and a warning banner names what's missing
- Friendly error states for non-form pages, missing fields, and permission
  errors, with a mailto link to the CRM Administrator support mailbox

## Installation

This extension is not published to the Chrome Web Store. Install it as an
unpacked extension:

1. Clone or download this repository to your machine.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the project folder
   (`oh-webform-name-extension/`).
5. The Orlando Health Form Name Reader icon should now appear in your
   extensions toolbar.

## Usage

1. Navigate to any Orlando Health FormAssembly form on `*.tfaforms.net`, or to
   a page that embeds one via iframe.
2. Click the extension icon.
3. The popup displays the Form Name and Form ID. Click either field to copy
   its value to the clipboard.

If a field is missing or empty, the popup shows a warning banner and a contact
link instead of an unusable chip.

## File Structure

```
oh-webform-name-extension/
├── manifest.json   Manifest V3 configuration, permissions, content scripts
├── popup.html      Popup UI markup and styles
├── popup.js        Popup logic: extracts form fields, handles copy-to-clipboard
└── icons/          16/48/128 px extension icons
```

The extension uses `chrome.scripting.executeScript` with `allFrames: true` to
look inside iframes, then prefers a frame that has both `Form Name` and
`Form ID` populated.

## Development

There is no build step. Edit the files directly and reload the extension from
`chrome://extensions` to pick up changes.

To bump the version, update `manifest.json` and the changelog comments at the
top of `popup.html` and `popup.js`.

## Changelog

- **1.3.0** — Form Name and Form ID are checked independently; partial results
  are shown with a warning banner when one field is missing
- **1.2.3** — Left-aligned error messages; the support email is a clickable
  mailto link
- **1.2.2** — Improved error messages: distinguishes "no form on this page"
  from "form found, but hidden fields are missing"
- **1.2.1** — Fixed false `MISSING_FIELDS` error on SharePoint pages that
  embed the form in an iframe
- **1.2.0** — Added support for forms embedded via iframe
- **1.1.3** — Added detection for TFAForms pages missing required fields
- **1.1.2** — Simplified DOM loading with better error handling
- **1.1.1** — Fixed a DOM loading issue (elements not initializing)
- **1.1.0** — Implemented 1Password-style click-to-copy interaction
- **1.0.1** — Added separate copy buttons for name and ID
- **1.0.0** — Initial improvements (encoding fixes, error handling)
