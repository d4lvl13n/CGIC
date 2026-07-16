<?php
/**
 * Plugin Name: CGIC Content Platform
 * Description: Jobs, editorial fields, permissions, REST exposure, and Next.js cache invalidation for CGIC.
 * Version: 0.1.0
 * Author: Codolie Labs SL
 * Requires at least: 6.6
 * Requires PHP: 8.1
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CGIC_CONTENT_VERSION', '0.1.0');

function cgic_register_content_types(): void
{
    register_post_type('job', [
        'labels' => [
            'name' => __('Jobs', 'cgic'),
            'singular_name' => __('Job', 'cgic'),
            'add_new_item' => __('Add job', 'cgic'),
            'edit_item' => __('Edit job', 'cgic'),
            'all_items' => __('All jobs', 'cgic'),
        ],
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'jobs',
        'has_archive' => false,
        'rewrite' => ['slug' => 'jobs'],
        'supports' => ['title', 'thumbnail', 'revisions'],
        'menu_icon' => 'dashicons-id-alt',
        'capability_type' => ['job', 'jobs'],
        'map_meta_cap' => true,
    ]);

    $taxonomies = [
        'job_location' => ['Location', 'Locations'],
        'job_expertise' => ['Expertise', 'Expertise'],
        'job_contract_type' => ['Contract type', 'Contract types'],
        'job_work_mode' => ['Work mode', 'Work modes'],
        'job_skill' => ['Skill', 'Skills'],
    ];

    foreach ($taxonomies as $taxonomy => [$singular, $plural]) {
        register_taxonomy($taxonomy, ['job'], [
            'labels' => [
                'name' => __($plural, 'cgic'),
                'singular_name' => __($singular, 'cgic'),
            ],
            'public' => true,
            'show_ui' => true,
            'show_admin_column' => in_array($taxonomy, ['job_location', 'job_contract_type'], true),
            'show_in_rest' => true,
            'hierarchical' => $taxonomy !== 'job_skill',
            'rewrite' => false,
        ]);
    }
}
add_action('init', 'cgic_register_content_types');

function cgic_disable_job_block_editor(bool $use_block_editor, string $post_type): bool
{
    return $post_type === 'job' ? false : $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'cgic_disable_job_block_editor', 10, 2);

function cgic_polylang_post_types(array $post_types, bool $is_settings): array
{
    $post_types['job'] = 'job';
    return $post_types;
}
add_filter('pll_get_post_types', 'cgic_polylang_post_types', 10, 2);

function cgic_polylang_taxonomies(array $taxonomies, bool $is_settings): array
{
    foreach (['job_location', 'job_expertise', 'job_contract_type', 'job_work_mode', 'job_skill'] as $taxonomy) {
        $taxonomies[$taxonomy] = $taxonomy;
    }
    return $taxonomies;
}
add_filter('pll_get_taxonomies', 'cgic_polylang_taxonomies', 10, 2);

function cgic_register_acf_fields(): void
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_cgic_job_details',
        'title' => __('Job details', 'cgic'),
        'show_in_rest' => 1,
        'fields' => [
            ['key' => 'field_cgic_job_reference', 'label' => __('Internal reference', 'cgic'), 'name' => 'reference', 'type' => 'text', 'required' => 1, 'instructions' => 'Example: CGIC-2026-014'],
            ['key' => 'field_cgic_job_summary', 'label' => __('Short summary', 'cgic'), 'name' => 'summary', 'type' => 'textarea', 'required' => 1, 'maxlength' => 280, 'rows' => 3],
            ['key' => 'field_cgic_job_responsibilities', 'label' => __('Responsibilities', 'cgic'), 'name' => 'responsibilities', 'type' => 'wysiwyg', 'required' => 1, 'toolbar' => 'basic', 'media_upload' => 0],
            ['key' => 'field_cgic_job_profile', 'label' => __('Candidate profile', 'cgic'), 'name' => 'candidate_profile', 'type' => 'wysiwyg', 'required' => 1, 'toolbar' => 'basic', 'media_upload' => 0],
            ['key' => 'field_cgic_job_offer', 'label' => __('What CGIC offers', 'cgic'), 'name' => 'offer', 'type' => 'wysiwyg', 'toolbar' => 'basic', 'media_upload' => 0],
            ['key' => 'field_cgic_job_start_date', 'label' => __('Start date', 'cgic'), 'name' => 'start_date', 'type' => 'date_picker', 'return_format' => 'Y-m-d'],
            ['key' => 'field_cgic_job_closing_date', 'label' => __('Closing date', 'cgic'), 'name' => 'closing_date', 'type' => 'date_picker', 'required' => 1, 'return_format' => 'Y-m-d'],
            ['key' => 'field_cgic_job_state', 'label' => __('Job state', 'cgic'), 'name' => 'job_state', 'type' => 'select', 'required' => 1, 'choices' => ['open' => 'Open', 'closed' => 'Closed'], 'default_value' => 'open', 'return_format' => 'value'],
            ['key' => 'field_cgic_job_featured', 'label' => __('Featured', 'cgic'), 'name' => 'featured', 'type' => 'true_false', 'default_value' => 0, 'ui' => 1],
            ['key' => 'field_cgic_job_application_url', 'label' => __('Application URL', 'cgic'), 'name' => 'application_url', 'type' => 'url', 'required' => 1, 'instructions' => __('Use the approved ATS or managed application form URL.', 'cgic')],
            ['key' => 'field_cgic_job_applicant_countries', 'label' => __('Remote applicant countries', 'cgic'), 'name' => 'applicant_countries', 'type' => 'select', 'multiple' => 1, 'ui' => 1, 'choices' => ['BE' => 'Belgium', 'FR' => 'France', 'NL' => 'Netherlands', 'LU' => 'Luxembourg', 'DE' => 'Germany']],
            ['key' => 'field_cgic_job_contact_name', 'label' => __('Contact display name', 'cgic'), 'name' => 'contact_name', 'type' => 'text'],
            ['key' => 'field_cgic_job_seo_title', 'label' => __('SEO title', 'cgic'), 'name' => 'seo_title', 'type' => 'text', 'maxlength' => 65],
            ['key' => 'field_cgic_job_seo_description', 'label' => __('SEO description', 'cgic'), 'name' => 'seo_description', 'type' => 'textarea', 'maxlength' => 160, 'rows' => 3],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'job']]],
        'position' => 'normal',
        'style' => 'default',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_cgic_article_details',
        'title' => __('Article details', 'cgic'),
        'show_in_rest' => 1,
        'fields' => [
            ['key' => 'field_cgic_article_byline', 'label' => __('Public byline', 'cgic'), 'name' => 'byline', 'type' => 'text', 'required' => 1, 'default_value' => 'CGIC Editorial Team'],
            ['key' => 'field_cgic_article_featured', 'label' => __('Featured article', 'cgic'), 'name' => 'featured', 'type' => 'true_false', 'default_value' => 0, 'ui' => 1],
            ['key' => 'field_cgic_article_seo_title', 'label' => __('SEO title', 'cgic'), 'name' => 'seo_title', 'type' => 'text', 'maxlength' => 65],
            ['key' => 'field_cgic_article_seo_description', 'label' => __('SEO description', 'cgic'), 'name' => 'seo_description', 'type' => 'textarea', 'maxlength' => 160, 'rows' => 3],
            ['key' => 'field_cgic_article_social_image', 'label' => __('Social image', 'cgic'), 'name' => 'social_image', 'type' => 'image', 'return_format' => 'array', 'preview_size' => 'medium'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'post']]],
        'position' => 'side',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_cgic_location_details',
        'title' => __('Structured location', 'cgic'),
        'show_in_rest' => 1,
        'fields' => [
            ['key' => 'field_cgic_location_city', 'label' => __('City', 'cgic'), 'name' => 'city', 'type' => 'text'],
            ['key' => 'field_cgic_location_region', 'label' => __('Region', 'cgic'), 'name' => 'region', 'type' => 'text'],
            ['key' => 'field_cgic_location_country', 'label' => __('Country code', 'cgic'), 'name' => 'country_code', 'type' => 'text', 'required' => 1, 'default_value' => 'BE', 'maxlength' => 2],
            ['key' => 'field_cgic_location_postcode', 'label' => __('Postal code', 'cgic'), 'name' => 'postal_code', 'type' => 'text'],
            ['key' => 'field_cgic_location_street', 'label' => __('Street address', 'cgic'), 'name' => 'street_address', 'type' => 'text'],
        ],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'job_location']]],
        'active' => true,
    ]);
}
add_action('acf/include_fields', 'cgic_register_acf_fields');

function cgic_add_roles(): void
{
    add_role('cgic_job_editor', __('Job Editor', 'cgic'), ['read' => true, 'upload_files' => true]);
    add_role('cgic_article_editor', __('Article Editor', 'cgic'), ['read' => true, 'upload_files' => true, 'edit_posts' => true, 'edit_published_posts' => true, 'publish_posts' => true, 'delete_posts' => true]);

    $job_capabilities = [
        'edit_job', 'read_job', 'delete_job', 'edit_jobs', 'edit_others_jobs',
        'publish_jobs', 'read_private_jobs', 'delete_jobs', 'delete_private_jobs',
        'delete_published_jobs', 'delete_others_jobs', 'edit_private_jobs', 'edit_published_jobs',
    ];
    foreach (['administrator', 'editor', 'cgic_job_editor'] as $role_name) {
        $role = get_role($role_name);
        if (!$role) continue;
        foreach ($job_capabilities as $capability) $role->add_cap($capability);
    }
}
register_activation_hook(__FILE__, 'cgic_add_roles');

function cgic_rest_indexing_headers(): void
{
    if (!is_admin()) {
        header('X-Robots-Tag: noindex, nofollow', true);
    }
}
add_action('send_headers', 'cgic_rest_indexing_headers');

function cgic_queue_webhook(int $post_id, WP_Post $post): void
{
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
    if (!in_array($post->post_type, ['job', 'post'], true)) return;
    $GLOBALS['cgic_webhook_events'][$post_id] = [
        'event' => 'content.saved',
        'postType' => $post->post_type,
        'postId' => $post_id,
        'locale' => function_exists('pll_get_post_language') ? pll_get_post_language($post_id, 'slug') : null,
        'modifiedAt' => get_post_modified_time(DATE_ATOM, true, $post_id),
    ];
}
add_action('save_post', 'cgic_queue_webhook', 20, 2);

function cgic_send_webhooks(): void
{
    $url = defined('CGIC_WEBHOOK_URL') ? CGIC_WEBHOOK_URL : getenv('CGIC_WEBHOOK_URL');
    $secret = defined('CGIC_WEBHOOK_SECRET') ? CGIC_WEBHOOK_SECRET : getenv('CGIC_WEBHOOK_SECRET');
    if (!$url || !$secret || empty($GLOBALS['cgic_webhook_events'])) return;

    foreach ($GLOBALS['cgic_webhook_events'] as $payload) {
        $body = wp_json_encode($payload);
        $timestamp = (string) time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $body, $secret);
        wp_remote_post($url, [
            'timeout' => 5,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-CGIC-Timestamp' => $timestamp,
                'X-CGIC-Signature' => 'sha256=' . $signature,
            ],
            'body' => $body,
        ]);
    }
}
add_action('shutdown', 'cgic_send_webhooks');

function cgic_job_columns(array $columns): array
{
    return [
        'cb' => $columns['cb'],
        'title' => __('Title', 'cgic'),
        'cgic_reference' => __('Reference', 'cgic'),
        'taxonomy-job_location' => __('Location', 'cgic'),
        'taxonomy-job_contract_type' => __('Contract', 'cgic'),
        'cgic_state' => __('State', 'cgic'),
        'cgic_closing_date' => __('Closing date', 'cgic'),
        'date' => $columns['date'],
    ];
}
add_filter('manage_job_posts_columns', 'cgic_job_columns');

function cgic_job_column_value(string $column, int $post_id): void
{
    if (!function_exists('get_field')) return;
    if ($column === 'cgic_reference') echo esc_html((string) get_field('reference', $post_id));
    if ($column === 'cgic_state') echo esc_html((string) get_field('job_state', $post_id));
    if ($column === 'cgic_closing_date') echo esc_html((string) get_field('closing_date', $post_id));
}
add_action('manage_job_posts_custom_column', 'cgic_job_column_value', 10, 2);
