# Cinematic Web — Professional CMS Architecture

## TABLE OF CONTENTS
1. [CMS Selection Flow](#selection)
2. [Universal Content Architecture](#universal)
3. [Content Type Library](#types)
4. [Publishing Workflow System](#workflow)
5. [Role & Permission Matrix](#roles)
6. [Media Library Architecture](#media)
7. [Sanity — Full Schema Definitions](#sanity)
8. [Contentful — Content Models](#contentful)
9. [Strapi — Collection Types](#strapi)
10. [Payload CMS — TypeScript Config](#payload)
11. [Custom CMS — Built From Scratch](#custom)
12. [API Layer — REST + GraphQL](#api)
13. [Webhook System](#webhooks)
14. [i18n / Localization Schema](#i18n)

---

## CMS SELECTION FLOW {#selection}

Run in Phase 4 after tech stack is confirmed. Ask:

```
Do you have a CMS subscription or budget for one?

A) YES — I have / can afford a CMS → Ask which: Sanity / Contentful / Strapi / Payload
B) LOW BUDGET (under $50/mo) → Recommend Strapi self-hosted (free) or Payload (free)
C) NO BUDGET → Build a custom CMS from scratch (see Custom CMS section)
D) STATIC ONLY → No CMS — content in markdown/MDX files + git-based workflow

Present this choice clearly with monthly cost of each:
┌────────────────────────────────────────────────────────────┐
│  CMS OPTIONS                                               │
├─────────────────┬─────────────────┬────────────────────────┤
│ Sanity           │ $0–$99+/mo      │ Best DX, GROQ, real-time│
│ Contentful       │ $0–$489+/mo     │ Enterprise-grade CDN    │
│ Strapi           │ $0 self-hosted  │ Full control, open source│
│ Payload CMS      │ $0 self-hosted  │ Code-first, TypeScript  │
│ Custom (scratch) │ $0              │ Full ownership, any DB  │
└─────────────────┴─────────────────┴────────────────────────┘
```

---

## UNIVERSAL CONTENT ARCHITECTURE {#universal}

Apply these principles regardless of which CMS is used:

### Content Modeling Principles

**1. Single Source of Truth**
Every piece of content lives in exactly one place. Use references, not copies.
```
❌ WRONG: Embed author data inside every blog post
✅ RIGHT: Author is a separate type — posts reference author by ID
```

**2. Modular / Block Architecture**
Pages are built from reusable blocks, not monolithic templates.
```
Page → [HeroBlock | FeatureGrid | Testimonials | CTABanner | FAQSection | ...]
Each block is self-contained: its own fields, validation, preview
```

**3. Content ≠ Presentation**
CMS stores raw content and structure. Styling is 100% in code.
```
❌ WRONG: CMS field "button_color: #FF0000"
✅ RIGHT: CMS field "cta_variant: primary | secondary | ghost"
```

**4. SEO Fields on Every Content Type**
Every page-level content type inherits or overrides a global SEO object:
```typescript
type SEOFields = {
  metaTitle:       string;     // Override page title for SEO
  metaDescription: string;     // 150–160 chars
  ogImage:         MediaRef;   // Social share image
  canonicalUrl:    string;     // Optional canonical override
  noIndex:         boolean;    // Exclude from search (default: false)
  structuredData:  string;     // Optional JSON-LD override
};
```

**5. All Media Through Cloudinary**
CMS stores only the Cloudinary public_id. The frontend builds URLs with transformations.
Never store full Cloudinary URLs in CMS — they're computed, not stored.

---

## CONTENT TYPE LIBRARY {#types}

### Global / Singleton Types (one instance each)
```
SiteSettings      → site name, logo, favicon, default SEO, social links
Navigation        → main nav items, footer nav, mobile nav
Footer            → columns, links, legal text, social icons
CookieBanner      → text, accept/decline labels
AnnouncementBar   → message, link, visibility toggle, start/end date
```

### Page Types
```
HomePage          → unique hero config, sections (ordered blocks)
AboutPage         → story content, team members, values, timeline
ProductPage       → product sections, features, screenshots, demo
PricingPage       → plans array, comparison table, FAQ items
ContactPage       → form config, office locations, map embed config
LandingPage       → generic, flexible page builder (any block combination)
BlogIndex         → listing config, featured posts, category filters
BlogPost          → full blog article with rich content
CaseStudy         → client story: problem, solution, results, metrics
LegalPage         → privacy policy, terms — rich text only
```

### Reusable Block Types
```
HeroBlock         → headline, subheadline, hero line, CTA buttons, media
FeatureGrid       → heading, features array [icon, title, description]
TestimonialBlock  → heading, testimonials array [quote, author, role, avatar]
CTASection        → headline, description, primary CTA, secondary CTA, bg variant
FAQSection        → heading, FAQ items [question, answer]
StatsBanner       → stats array [value, label, prefix, suffix]
LogoCloud         → heading, logos array [image, alt, url]
PricingTable      → plans array (see PricingPlan type)
TeamSection       → heading, team members array
TimelineSection   → heading, timeline events array
VideoSection      → heading, video (Cloudinary), poster, caption
ComparisonTable   → heading, rows, columns, highlighted column
RichTextSection   → pure markdown/portable text block
EmbedSection      → iframe src, aspect ratio, caption
```

### Shared Object Types (embedded in other types, not standalone)
```
MediaAsset        → cloudinaryId, alt, width, height, type (image|video)
CTAButton         → label, href, variant, target, icon
NavItem           → label, href, children[], icon, badge
TeamMember        → name, role, bio, avatar (MediaAsset), socials
Testimonial       → quote, authorName, authorRole, authorCompany, avatar, rating
PricingPlan       → name, price, billingPeriod, description, features[], cta, highlighted
FAQItem           → question, answer (rich text)
TimelineEvent     → date, title, description, icon, media
Stat              → value, label, prefix, suffix, description
```

---

## PUBLISHING WORKFLOW SYSTEM {#workflow}

Every content type has a `status` field:

```typescript
type PublishStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

type WorkflowMeta = {
  status:         PublishStatus;
  createdAt:      Date;
  updatedAt:      Date;
  publishedAt:    Date | null;
  scheduledFor:   Date | null;    // Future publish date
  archivedAt:     Date | null;
  createdBy:      UserRef;
  updatedBy:      UserRef;
  approvedBy:     UserRef | null;
  revisionCount:  number;
  changeNotes:    string;         // "What changed in this update"
};
```

### Status Transitions
```
DRAFT → IN_REVIEW (author submits for review)
IN_REVIEW → APPROVED (editor approves)
IN_REVIEW → DRAFT (editor requests changes)
APPROVED → PUBLISHED (editor/admin publishes, or scheduled auto-publish)
PUBLISHED → DRAFT (unpublish — reverts to draft for editing)
PUBLISHED → ARCHIVED (retire content — stays accessible via direct URL if needed)
ARCHIVED → DRAFT (restore for re-editing)
```

### Version History
Every save creates a new version. Store at minimum:
```typescript
type ContentVersion = {
  id:          string;
  contentId:   string;
  contentType: string;
  snapshot:    Record<string, unknown>;  // Full field snapshot
  createdAt:   Date;
  createdBy:   UserRef;
  changeNotes: string;
  isPublished: boolean;
};
```

---

## ROLE & PERMISSION MATRIX {#roles}

```
┌────────────────────────────────────────────────────────────────────┐
│ PERMISSION          │ Admin │ Editor │ Author │ Viewer │ API Client│
├────────────────────────────────────────────────────────────────────┤
│ Create content      │  ✓   │   ✓   │   ✓   │   ✗   │    ✗      │
│ Edit own content    │  ✓   │   ✓   │   ✓   │   ✗   │    ✗      │
│ Edit others content │  ✓   │   ✓   │   ✗   │   ✗   │    ✗      │
│ Submit for review   │  ✓   │   ✓   │   ✓   │   ✗   │    ✗      │
│ Approve content     │  ✓   │   ✓   │   ✗   │   ✗   │    ✗      │
│ Publish content     │  ✓   │   ✓   │   ✗   │   ✗   │    ✗      │
│ Delete content      │  ✓   │   ✗   │   ✗   │   ✗   │    ✗      │
│ Archive content     │  ✓   │   ✓   │   ✗   │   ✗   │    ✗      │
│ Manage media        │  ✓   │   ✓   │   ✓   │   ✗   │    ✗      │
│ Manage users        │  ✓   │   ✗   │   ✗   │   ✗   │    ✗      │
│ Manage API tokens   │  ✓   │   ✗   │   ✗   │   ✗   │    ✗      │
│ Manage webhooks     │  ✓   │   ✗   │   ✗   │   ✗   │    ✗      │
│ View analytics      │  ✓   │   ✓   │   ✗   │   ✓   │    ✗      │
│ Read via API        │  ✗   │   ✗   │   ✗   │   ✗   │    ✓      │
│ Write via API       │  ✗   │   ✗   │   ✗   │   ✗   │ scoped ✓  │
└────────────────────────────────────────────────────────────────────┘
```

---

## MEDIA LIBRARY ARCHITECTURE {#media}

```typescript
// Universal media asset structure (used across all CMS platforms)
type MediaAsset = {
  // Identity
  id:               string;
  cloudinaryId:     string;       // e.g. "projectslug/hero/hero-bg"
  cloudinaryVersion: number;      // For cache-busting: v1234567890

  // Type
  type:             'image' | 'video' | 'document' | 'audio';
  mimeType:         string;       // "image/webp", "video/mp4", etc.

  // Dimensions (images/video)
  width:            number | null;
  height:           number | null;
  duration:         number | null; // video: seconds

  // Accessibility
  alt:              string;       // REQUIRED for images — enforced
  caption:          string;       // Optional display caption
  credit:           string;       // Photographer/source credit

  // Organisation
  folder:           string;       // Cloudinary folder path
  tags:             string[];     // For filtering in media browser
  usedIn:           ContentRef[]; // Back-references: which content uses this

  // Meta
  fileSize:         number;       // bytes
  originalFilename: string;
  uploadedBy:       UserRef;
  uploadedAt:       Date;
};
```

---

## SANITY — FULL SCHEMA DEFINITIONS {#sanity}

```typescript
// sanity/schemas/index.ts
import siteSettings  from './singletons/siteSettings';
import navigation    from './singletons/navigation';
import homePage      from './pages/homePage';
import blogPost      from './documents/blogPost';
import author        from './documents/author';
import mediaAsset    from './objects/mediaAsset';
import heroBlock     from './blocks/heroBlock';
import featureGrid   from './blocks/featureGrid';
import ctaButton     from './objects/ctaButton';

export const schemaTypes = [
  siteSettings, navigation,
  homePage, blogPost, author,
  mediaAsset, heroBlock, featureGrid, ctaButton,
];
```

```typescript
// sanity/schemas/documents/blogPost.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content',    title: 'Content',    default: true },
    { name: 'seo',        title: 'SEO & Social' },
    { name: 'publishing', title: 'Publishing' },
  ],
  fields: [
    // ── CONTENT GROUP ──────────────────────────────────────────
    defineField({
      name: 'title', title: 'Title', type: 'string',
      group: 'content',
      validation: R => R.required().min(10).max(100),
    }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'excerpt', title: 'Excerpt', type: 'text',
      group: 'content',
      description: 'Short description shown in listings (140–200 chars)',
      validation: R => R.required().max(200),
    }),
    defineField({
      name: 'coverImage', title: 'Cover Image', type: 'reference',
      to: [{ type: 'mediaAsset' }], group: 'content',
      validation: R => R.required(),
    }),
    defineField({
      name: 'author', title: 'Author', type: 'reference',
      to: [{ type: 'author' }], group: 'content',
      validation: R => R.required(),
    }),
    defineField({
      name: 'categories', title: 'Categories',
      type: 'array', of: [{ type: 'string' }],
      options: { list: [
        { title: 'Design',     value: 'design' },
        { title: 'Development',value: 'development' },
        { title: 'Business',   value: 'business' },
        { title: 'Tutorial',   value: 'tutorial' },
      ]},
      group: 'content',
    }),
    defineField({
      name: 'body', title: 'Body', type: 'array',
      group: 'content',
      of: [
        { type: 'block', styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'Quote', value: 'blockquote' },
        ]},
        { type: 'reference', to: [{ type: 'mediaAsset' }] },
        { type: 'code' }, // for code blocks
      ],
    }),
    defineField({
      name: 'readingTime', title: 'Reading Time (minutes)', type: 'number',
      group: 'content',
      readOnly: true, // Computed by a custom component
    }),

    // ── SEO GROUP ──────────────────────────────────────────────
    defineField({
      name: 'seo', title: 'SEO & Social',
      type: 'object', group: 'seo',
      fields: [
        defineField({ name: 'metaTitle',       type: 'string',
          validation: R => R.max(60) }),
        defineField({ name: 'metaDescription', type: 'text',
          validation: R => R.max(160) }),
        defineField({ name: 'ogImage', type: 'reference',
          to: [{ type: 'mediaAsset' }] }),
        defineField({ name: 'noIndex', type: 'boolean',
          initialValue: false }),
      ],
    }),

    // ── PUBLISHING GROUP ───────────────────────────────────────
    defineField({
      name: 'status', title: 'Status',
      type: 'string', group: 'publishing',
      options: { list: [
        { title: '📝 Draft',     value: 'draft' },
        { title: '👀 In Review', value: 'in_review' },
        { title: '✅ Approved',  value: 'approved' },
        { title: '🌐 Published', value: 'published' },
        { title: '📦 Archived',  value: 'archived' },
      ]},
      initialValue: 'draft',
    }),
    defineField({
      name: 'publishedAt', title: 'Published At',
      type: 'datetime', group: 'publishing',
    }),
    defineField({
      name: 'scheduledFor', title: 'Schedule Publish',
      type: 'datetime', group: 'publishing',
      description: 'Auto-publish at this date/time',
    }),
    defineField({
      name: 'changeNotes', title: 'Change Notes', type: 'text',
      group: 'publishing',
      description: 'Briefly describe what changed in this update',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'coverImage.cloudinaryId',
    },
  },
});
```

### GROQ Queries (for frontend data fetching)
```typescript
// lib/sanity/queries.ts
export const blogPostsQuery = `
  *[_type == "blogPost" && status == "published"]
  | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, readingTime,
    "coverImage": coverImage->{ cloudinaryId, alt, width, height },
    "author": author->{ name, "avatar": avatar->{ cloudinaryId, alt } },
    categories
  }
`;

export const blogPostBySlugQuery = `
  *[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
    _id, title, slug, excerpt, body, publishedAt, readingTime,
    "coverImage": coverImage->{ cloudinaryId, alt, width, height },
    "author": author->{ name, bio, "avatar": avatar->{ cloudinaryId, alt } },
    categories,
    seo
  }
`;

export const homePageQuery = `
  *[_type == "homePage"][0] {
    sections[] {
      _type,
      ...
    },
    seo
  }
`;
```

---

## CONTENTFUL — CONTENT MODELS {#contentful}

```typescript
// scripts/setup-contentful.ts — Programmatic space setup
import { createClient } from 'contentful-management';

const client = createClient({ accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN! });

async function createBlogPostModel(environment: any) {
  await environment.createContentTypeWithId('blogPost', {
    name: 'Blog Post',
    displayField: 'title',
    fields: [
      { id: 'title',       name: 'Title',       type: 'Symbol',   required: true,
        validations: [{ size: { min: 10, max: 100 } }] },
      { id: 'slug',        name: 'Slug',        type: 'Symbol',   required: true,
        validations: [{ unique: true }, { regexp: { pattern: '^[a-z0-9-]+$' } }] },
      { id: 'excerpt',     name: 'Excerpt',     type: 'Text',     required: true,
        validations: [{ size: { max: 200 } }] },
      { id: 'coverImage',  name: 'Cover Image', type: 'Link',     linkType: 'Asset',
        required: true },
      { id: 'author',      name: 'Author',      type: 'Link',     linkType: 'Entry',
        validations: [{ linkContentType: ['author'] }] },
      { id: 'body',        name: 'Body',        type: 'RichText', required: true },
      { id: 'categories',  name: 'Categories',  type: 'Array',
        items: { type: 'Symbol',
          validations: [{ in: ['design','development','business','tutorial'] }] }},
      { id: 'publishedAt', name: 'Published At', type: 'Date' },
      { id: 'status',      name: 'Status',      type: 'Symbol',
        validations: [{ in: ['draft','in_review','published','archived'] }] },
      { id: 'seoTitle',    name: 'SEO Title',   type: 'Symbol',
        validations: [{ size: { max: 60 } }] },
      { id: 'seoDescription', name: 'SEO Description', type: 'Text',
        validations: [{ size: { max: 160 } }] },
      { id: 'ogImage',     name: 'OG Image',    type: 'Link',     linkType: 'Asset' },
    ],
  });
}
```

### Contentful Delivery API queries
```typescript
// lib/contentful.ts
import { createClient } from 'contentful';

const client = createClient({
  space:        process.env.CONTENTFUL_SPACE_ID!,
  accessToken:  process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment:  process.env.CONTENTFUL_ENVIRONMENT ?? 'master',
});

export async function getBlogPosts() {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    'fields.status': 'published',
    order: ['-fields.publishedAt'],
    select: ['fields.title','fields.slug','fields.excerpt',
             'fields.coverImage','fields.author','fields.publishedAt'],
  });
  return entries.items;
}

// Preview client (draft content)
export const previewClient = createClient({
  space:        process.env.CONTENTFUL_SPACE_ID!,
  accessToken:  process.env.CONTENTFUL_PREVIEW_TOKEN!,
  host:         'preview.contentful.com',
});
```

---

## STRAPI — COLLECTION TYPES {#strapi}

```javascript
// src/api/blog-post/content-types/blog-post/schema.json
{
  "kind": "collectionType",
  "collectionName": "blog_posts",
  "info": { "singularName": "blog-post", "pluralName": "blog-posts",
            "displayName": "Blog Post" },
  "options": { "draftAndPublish": true },
  "pluginsOptions": { "i18n": { "localized": true } },
  "attributes": {
    "title":      { "type": "string",   "required": true,
                    "minLength": 10, "maxLength": 100,
                    "pluginOptions": { "i18n": { "localized": true } } },
    "slug":       { "type": "uid", "targetField": "title", "required": true },
    "excerpt":    { "type": "text",     "required": true, "maxLength": 200,
                    "pluginOptions": { "i18n": { "localized": true } } },
    "body":       { "type": "richtext", "required": true,
                    "pluginOptions": { "i18n": { "localized": true } } },
    "coverImage": { "type": "media",    "multiple": false,
                    "required": true,
                    "allowedTypes": ["images"] },
    "author":     { "type": "relation", "relation": "manyToOne",
                    "target": "api::author.author" },
    "categories": { "type": "enumeration",
                    "enum": ["design","development","business","tutorial"] },
    "readingTime":{ "type": "integer" },
    "status":     { "type": "enumeration",
                    "enum": ["draft","in_review","approved","published","archived"],
                    "default": "draft" },
    "publishedAt":{ "type": "datetime" },
    "scheduledFor":{"type": "datetime" },
    "seo":        { "type": "component", "repeatable": false,
                    "component": "shared.seo" }
  }
}
```

```javascript
// src/components/shared/seo.json — Reusable SEO component
{
  "collectionName": "components_shared_seos",
  "info": { "displayName": "SEO", "icon": "search" },
  "attributes": {
    "metaTitle":       { "type": "string", "maxLength": 60 },
    "metaDescription": { "type": "text",   "maxLength": 160 },
    "ogImage":         { "type": "media",  "allowedTypes": ["images"] },
    "canonicalUrl":    { "type": "string" },
    "noIndex":         { "type": "boolean", "default": false },
    "structuredData":  { "type": "json" }
  }
}
```

---

## PAYLOAD CMS — TYPESCRIPT CONFIG {#payload}

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { cloudinaryPlugin } from 'payload-cloudinary-plugin';
import BlogPosts from './collections/BlogPosts';
import Authors   from './collections/Authors';
import Media     from './collections/Media';
import Pages     from './collections/Pages';
import Users     from './collections/Users';
import SiteSettings from './globals/SiteSettings';
import Navigation   from './globals/Navigation';

export default buildConfig({
  serverURL: process.env.PAYLOAD_URL ?? 'http://localhost:3000',
  admin: { user: Users.slug },
  collections: [BlogPosts, Authors, Media, Pages, Users],
  globals: [SiteSettings, Navigation],
  db: mongooseAdapter({ url: process.env.MONGODB_URI! }),
  editor: lexicalEditor({}),
  plugins: [
    cloudinaryPlugin({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key:    process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
      },
    }),
  ],
  typescript: { outputFile: 'types/payload.ts' },
  graphQL: { schemaOutputFile: 'types/schema.graphql' },
});
```

```typescript
// collections/BlogPosts.ts
import { CollectionConfig } from 'payload/types';
import { seoField } from '../fields/seo';
import { workflowField } from '../fields/workflow';

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'publishedAt'],
    preview: (doc) => `${process.env.SITE_URL}/blog/${doc.slug}`,
  },
  access: {
    read:   ({ req }) => req.user?.role !== 'viewer'
                         ? true
                         : { status: { equals: 'published' } },
    create: ({ req }) => ['admin','editor','author'].includes(req.user?.role),
    update: ({ req, id }) => {
      if (['admin','editor'].includes(req.user?.role)) return true;
      // Authors can only update their own posts
      return { author: { equals: req.user?.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  versions: { maxPerDoc: 20, drafts: { autosave: { interval: 30000 } } },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-calculate reading time
        if (data.body) {
          const words = JSON.stringify(data.body).split(' ').length;
          data.readingTime = Math.ceil(words / 200);
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc }) => {
        // Trigger webhook on publish
        if (doc.status === 'published') {
          await fetch(process.env.REVALIDATE_WEBHOOK_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'blog-post', slug: doc.slug }),
          });
        }
      },
    ],
  },
  fields: [
    { name: 'title',   type: 'text', required: true },
    { name: 'slug',    type: 'text', required: true, unique: true,
      admin: { position: 'sidebar' } },
    { name: 'excerpt', type: 'textarea', required: true,
      maxLength: 200 },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'author',  type: 'relationship', relationTo: 'authors', required: true },
    { name: 'categories', type: 'select', hasMany: true,
      options: ['design','development','business','tutorial'] },
    { name: 'body',    type: 'richText', required: true },
    { name: 'readingTime', type: 'number', admin: { readOnly: true } },
    workflowField,
    seoField,
  ],
};
export default BlogPosts;
```

---

## CUSTOM CMS — BUILT FROM SCRATCH {#custom}

For zero-budget projects. Uses Next.js API routes + Supabase (PostgreSQL) as the database.

### Database Schema (PostgreSQL via Supabase)
```sql
-- ── USERS & ROLES ─────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'author'
                CHECK (role IN ('admin','editor','author','viewer')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MEDIA ASSETS ───────────────────────────────────────────────
CREATE TABLE media_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_id     TEXT NOT NULL UNIQUE,
  cloudinary_version BIGINT,
  type              TEXT NOT NULL CHECK (type IN ('image','video','document','audio')),
  mime_type         TEXT,
  alt               TEXT NOT NULL DEFAULT '',
  caption           TEXT,
  credit            TEXT,
  width             INTEGER,
  height            INTEGER,
  duration_seconds  NUMERIC,
  file_size_bytes   BIGINT,
  folder            TEXT,
  tags              TEXT[] DEFAULT '{}',
  uploaded_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOG POSTS ─────────────────────────────────────────────────
CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 10 AND 100),
  slug            TEXT UNIQUE NOT NULL,
  excerpt         TEXT CHECK (length(excerpt) <= 200),
  body            JSONB,                -- Rich text as JSON (TipTap/Lexical format)
  cover_image_id  UUID REFERENCES media_assets(id),
  author_id       UUID REFERENCES users(id),
  categories      TEXT[] DEFAULT '{}',
  reading_time    INTEGER,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','in_review','approved','published','archived')),
  published_at    TIMESTAMPTZ,
  scheduled_for   TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,
  change_notes    TEXT,
  revision_count  INTEGER DEFAULT 1,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),

  -- SEO fields
  meta_title      TEXT CHECK (length(meta_title) <= 60),
  meta_description TEXT CHECK (length(meta_description) <= 160),
  og_image_id     UUID REFERENCES media_assets(id),
  canonical_url   TEXT,
  no_index        BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTENT VERSIONS ───────────────────────────────────────────
CREATE TABLE content_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id   UUID NOT NULL,
  content_type TEXT NOT NULL,
  snapshot     JSONB NOT NULL,
  change_notes TEXT,
  created_by   UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAGES (flexible block builder) ────────────────────────────
CREATE TABLE pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  sections        JSONB DEFAULT '[]',  -- Ordered array of block objects
  template        TEXT DEFAULT 'default',
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','in_review','approved','published','archived')),
  published_at    TIMESTAMPTZ,
  meta_title      TEXT,
  meta_description TEXT,
  og_image_id     UUID REFERENCES media_assets(id),
  no_index        BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── GLOBAL SETTINGS ────────────────────────────────────────────
CREATE TABLE global_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insert defaults:
INSERT INTO global_settings (key, value) VALUES
  ('site',       '{"name":"[BRAND_NAME]","description":"","url":""}'),
  ('navigation', '{"main":[],"footer":[],"mobile":[]}'),
  ('seo',        '{"defaultOgImage":null,"twitterHandle":""}'),
  ('social',     '{"twitter":"","linkedin":"","instagram":"","github":""}');

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
-- Enable RLS on ALL tables — never leave a table unprotected

-- ── USERS TABLE ───────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Users can read their own profile
CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth.uid() = id);
-- Admins can read all users
CREATE POLICY "Admins read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
-- Users can update their own profile (not role — admins only)
CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    role = (SELECT role FROM users WHERE id = auth.uid())  -- cannot escalate own role
  );
-- Only admins can insert or delete users
CREATE POLICY "Admins manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── MEDIA ASSETS TABLE ────────────────────────────────────────
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
-- Public read — media is generally public once uploaded
CREATE POLICY "Public read media" ON media_assets
  FOR SELECT USING (true);
-- Authors+ can upload media
CREATE POLICY "Authors upload media" ON media_assets
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('admin','editor','author'))
  );
-- Uploaders can update their own media; admins/editors can update any
CREATE POLICY "Owners update media" ON media_assets
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
-- Only admins can delete media
CREATE POLICY "Admins delete media" ON media_assets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── BLOG POSTS TABLE ─────────────────────────────────────────
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- Public: only read published posts
CREATE POLICY "Public read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');
-- Authenticated users see their own posts regardless of status
CREATE POLICY "Authors see own posts" ON blog_posts
  FOR SELECT USING (auth.uid() = created_by);
-- Admins/Editors see all posts
CREATE POLICY "Admins read all posts" ON blog_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
-- Authors create posts (own drafts only)
CREATE POLICY "Authors create posts" ON blog_posts
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('admin','editor','author'))
  );
-- Authors update own draft/in_review posts; editors/admins update any
CREATE POLICY "Authors update own posts" ON blog_posts
  FOR UPDATE USING (
    (auth.uid() = created_by AND status IN ('draft','in_review')) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
-- Only admins can delete
CREATE POLICY "Admins delete posts" ON blog_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── PAGES TABLE ───────────────────────────────────────────────
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
-- Public read published pages
CREATE POLICY "Public read published pages" ON pages
  FOR SELECT USING (status = 'published');
-- Editors/admins read all pages
CREATE POLICY "Editors read all pages" ON pages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
-- Editors/admins create, update pages
CREATE POLICY "Editors manage pages" ON pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );

-- ── CONTENT VERSIONS TABLE ────────────────────────────────────
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
-- Authors read versions of their own content
CREATE POLICY "Authors read own versions" ON content_versions
  FOR SELECT USING (created_by = auth.uid());
-- Editors/admins read all versions
CREATE POLICY "Editors read all versions" ON content_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
-- Anyone authenticated can create a version snapshot
CREATE POLICY "Authenticated create versions" ON content_versions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );
-- Versions are immutable — no updates or deletes except admin
CREATE POLICY "Admins manage versions" ON content_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── GLOBAL SETTINGS TABLE ─────────────────────────────────────
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
-- Public read global settings (needed for nav, footer, SEO defaults)
CREATE POLICY "Public read settings" ON global_settings
  FOR SELECT USING (true);
-- Only admins can modify global settings
CREATE POLICY "Admins manage settings" ON global_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── HELPER FUNCTION (reuse across policies) ───────────────────
-- Call instead of repeating the EXISTS subquery everywhere
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_editor_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','editor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_author_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
    AND role IN ('admin','editor','author')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── INDEXES ────────────────────────────────────────────────────
CREATE INDEX idx_blog_posts_status  ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug    ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author  ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_pub     ON blog_posts(published_at DESC);
CREATE INDEX idx_pages_slug         ON pages(slug);
CREATE INDEX idx_media_cloudinary   ON media_assets(cloudinary_id);
CREATE INDEX idx_versions_content   ON content_versions(content_id, content_type);
```

### Custom CMS Admin Panel (Next.js App Router)
```
app/
└── (cms)/
    ├── layout.tsx           ← CMS shell: sidebar nav + auth guard
    ├── dashboard/page.tsx   ← Stats: posts by status, recent activity
    ├── posts/
    │   ├── page.tsx         ← Posts list with filters/search/sort
    │   ├── new/page.tsx     ← New post editor
    │   └── [id]/
    │       ├── page.tsx     ← Edit post (TipTap editor)
    │       └── versions/page.tsx ← Version history
    ├── pages/
    │   ├── page.tsx         ← Pages list
    │   └── [id]/page.tsx    ← Page editor (drag-drop blocks)
    ├── media/page.tsx       ← Media library (Cloudinary browser)
    ├── navigation/page.tsx  ← Nav manager
    ├── settings/page.tsx    ← Global settings
    └── users/page.tsx       ← User management (admin only)
```

---

## API LAYER — REST + GRAPHQL {#api}

### REST Endpoints (Next.js API Routes)
```
GET    /api/posts                 → List published posts (paginated)
GET    /api/posts/[slug]          → Single post by slug
GET    /api/pages/[slug]          → Single page by slug
GET    /api/media                 → Media library (auth required)
POST   /api/posts                 → Create post (auth: author+)
PUT    /api/posts/[id]            → Update post (auth: scoped by role)
PATCH  /api/posts/[id]/status     → Change status (auth: editor+)
DELETE /api/posts/[id]            → Delete post (auth: admin)
POST   /api/media/upload          → Upload to Cloudinary (auth: author+)
POST   /api/revalidate            → Trigger ISR revalidation (secret token)
GET    /api/search?q=...          → Full-text search across posts/pages
```

### GraphQL Schema (auto-generated by Payload, or manual for custom)
```graphql
type BlogPost {
  id:           ID!
  title:        String!
  slug:         String!
  excerpt:      String
  body:         JSON
  coverImage:   MediaAsset
  author:       Author
  categories:   [String]
  readingTime:  Int
  publishedAt:  String
  seo:          SEOFields
}

type Query {
  blogPosts(
    status: String
    limit:  Int
    offset: Int
    category: String
    authorId: ID
  ): [BlogPost]!

  blogPost(slug: String!): BlogPost

  searchPosts(query: String!): [BlogPost]!
}
```

---

## WEBHOOK SYSTEM {#webhooks}

```typescript
// lib/webhooks.ts — Trigger rebuilds and notifications on publish
type WebhookEvent = 'content.published' | 'content.unpublished' | 'content.deleted';

interface WebhookPayload {
  event:       WebhookEvent;
  contentType: string;
  id:          string;
  slug?:       string;
  timestamp:   string;
}

export async function triggerWebhooks(payload: WebhookPayload) {
  const hooks = [
    // Rebuild deployed site (Vercel/Netlify)
    { url: process.env.DEPLOY_HOOK_URL, secret: process.env.DEPLOY_HOOK_SECRET },
    // Notify Slack channel
    { url: process.env.SLACK_WEBHOOK_URL, secret: null },
    // Custom webhook (user-defined)
    { url: process.env.CUSTOM_WEBHOOK_URL, secret: process.env.CUSTOM_WEBHOOK_SECRET },
  ].filter(h => h.url);

  await Promise.allSettled(
    hooks.map(({ url, secret }) =>
      fetch(url!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'X-Webhook-Secret': secret } : {}),
        },
        body: JSON.stringify(payload),
      })
    )
  );
}
```

---

## I18N / LOCALIZATION SCHEMA {#i18n}

```typescript
// Localization field wrapper — apply to any field that needs translation
type LocalizedString = {
  [locale: string]: string;  // e.g. { en: 'Hello', fr: 'Bonjour', es: 'Hola' }
};

// Supported locales config
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt'] as const;
export const DEFAULT_LOCALE = 'en' as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// i18n middleware for Next.js (next.config.ts)
const i18nConfig = {
  i18n: {
    locales:       SUPPORTED_LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localeDetection: true,
  },
};

// When CMS has i18n: generate locale-specific slugs
// e.g. /en/blog/post-slug | /fr/blog/titre-article | /es/blog/titulo-articulo
```
