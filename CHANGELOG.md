# Changelog

All notable changes to the Orlando Health Form Name Reader Chrome extension.

## 1.3.0
- Form Name and Form ID are now checked independently; partial results are
  shown with a warning banner when one of the two fields is missing.

## 1.2.3
- Error messages are left-aligned for readability.
- The support email is now a clickable `mailto:` link.

## 1.2.2
- Improved error messages: distinguishes "no form on this page" from
  "form found, but hidden fields are missing".

## 1.2.1
- Fixed a false `MISSING_FIELDS` error on SharePoint pages that embed the
  form in an iframe (the parent frame's URL was being checked instead of
  the form's frame).

## 1.2.0
- Added support for forms embedded via iframe.

## 1.1.3
- Added detection for TFAForms pages that are missing the required hidden
  fields, with a clearer error message in that case.

## 1.1.2
- Simplified DOM loading with better error handling.

## 1.1.1
- Fixed a DOM loading issue where popup elements failed to initialize.

## 1.1.0
- Redesigned popup with 1Password-style click-to-copy chips.

## 1.0.1
- Added separate copy buttons for the Form Name and Form ID.

## 1.0.0
- Initial release with encoding fixes, error handling, and a basic popup UI.
