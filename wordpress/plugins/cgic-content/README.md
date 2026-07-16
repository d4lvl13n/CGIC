# CGIC Content Platform plugin

This plugin is the version-controlled WordPress half of the CGIC headless content platform.

## Requirements

- WordPress on PHP 8.1+
- ACF Pro
- Polylang Pro
- `CGIC_WEBHOOK_URL` set to `https://www.cgic.be/api/revalidate`
- `CGIC_WEBHOOK_SECRET` matching `WORDPRESS_WEBHOOK_SIGNING_SECRET` in the Next.js environment

## Install later

1. Package the `cgic-content` directory as a ZIP.
2. Install and activate ACF Pro and Polylang Pro first.
3. Install and activate this plugin.
4. Configure French, English, and Dutch in Polylang.
5. Add initial translated taxonomy values.
6. Configure the webhook constants as host secrets, not in this directory.

The plugin currently provides the content model, roles, REST exposure, admin columns, and signed save webhooks. Exact-revision frontend preview, host cron configuration, retry persistence, publish-time validation, and scheduled job closure require the real WordPress environment and are intentionally completed during CMS setup.
