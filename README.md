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

This extension is not published to the Chrome Web Store or Microsoft Edge
Add-ons. You install it by downloading a ZIP from the
[latest release](https://github.com/murphybp2/oh-webform-name-extension/releases/latest)
and pointing **Chrome or Microsoft Edge** at the unzipped folder. No GitHub
account is required.

### Step 1: Download the extension

1. Go to the [latest release page](https://github.com/murphybp2/oh-webform-name-extension/releases/latest).
2. Under the **Assets** heading near the bottom, click the file ending in
   `.zip` to download it.

### Step 2: Unzip the downloaded file

1. Open your **Downloads** folder.
2. Double-click the ZIP file to extract it. You should now have a folder
   called `oh-webform-name-extension` next to the ZIP.

### Step 3: Load the extension into Chrome or Edge

1. Open Chrome or Microsoft Edge. In the address bar, type one of the
   following and press **Enter**:
   - **Chrome:** `chrome://extensions`
   - **Edge:** `edge://extensions`
2. Turn on the **Developer mode** toggle:
   - **Chrome:** the toggle is in the **top-right corner** of the page.
   - **Edge:** the toggle is in the **bottom-left** of the page sidebar.
3. Click the **Load unpacked** button that appears.
4. Browse to the unzipped `oh-webform-name-extension` folder and click
   **Select**.
5. The **Orlando Health Form Name Reader** icon should now appear in your
   extensions toolbar.

### Updating to a new version

When a new release is published, repeat the steps above. Before loading the
new version, click **Remove** on the old one in `chrome://extensions` (or
`edge://extensions`) so you don't have two copies installed.

### For developers

If you have Git installed and prefer to work from source, clone this
repository and load the cloned folder via the same `chrome://extensions`
(or `edge://extensions`) → **Load unpacked** flow.

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
`chrome://extensions` (or `edge://extensions` in Microsoft Edge) to pick up
changes.

To bump the version, update the version string in `manifest.json` and add an
entry to [CHANGELOG.md](CHANGELOG.md).
