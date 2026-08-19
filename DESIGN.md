# DESIGN.md: Sensen Bakery Homepage Clone

## Source
- URL: https://www.sensen.com.tw/
- Capture date: 2026-08-09
- Evidence: Firecrawl markdown/html/links scrape, Firecrawl branding/images scrape, local browser screenshot for layout reference.

## Design Summary
The source page is a warm bakery homepage with a fixed white header, brown logo/navigation, a spacious split hero, light cream section backgrounds, gold accents, and pink call-to-action areas. The rebuild keeps the same content hierarchy and visual rhythm, but replaces every photo/logo asset with styled image placeholders.

## Design Tokens

### Colors
- Primary brown: `#4e342e`
- Logo/nav brown: `#8d563d`
- Gold accent: `#c79043`
- Cream sand: `#eacda3`
- Soft sand background: `#f3e6c9`
- Pink CTA: `#ff9ba7`
- Soft pink section: `#ffe1e5`
- Body text: `#3e352f`
- Muted text: `#81746c`
- Border line: `#eee4d5`

### Typography
- Body and headings use Traditional Chinese system UI, matching the source's Microsoft JhengHei direction.
- Hero headline uses a serif display face to echo the source's large "BREAD! SENSEN BAKERY" slide.
- Navigation uses compact bold Chinese text with generous spacing.

### Spacing And Layout
- Header: fixed/sticky white bar, about 90px tall on desktop.
- Hero: two-column split, text left and large image stage right.
- Services: cream background, intro copy left, three tall image cards right.
- Baby CTA: pink band with a white content panel and split image/content layout.
- News: three cards with image placeholders and excerpt copy.
- Gifts: left copy rail plus 4-column product placeholder grid.
- Catering: dark brown band with two menu cards.
- Stores: four simple address blocks.

## Components
- Buttons are square-cornered, filled pink or sand, with bold labels.
- Image placeholders use warm diagonal texture, dashed inner border, and centered labels.
- Service cards add a dark bottom gradient and white overlay labels.
- The "Hot" badge is a round gold marker.
- Footer is a simple light-gray copyright strip.

## Page Patterns
The page follows the original homepage order: header, hero carousel, happiness/service intro, baby gift sample CTA, latest news, selected gifts, catering service, store locations, footer.

## Build Instructions
When replacing placeholders with real assets, keep each placeholder's aspect ratio and section rhythm. Do not change the text hierarchy unless the section content changes. Keep the palette warm and food-focused: white, cream, brown, gold, and pink.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://www.sensen.com.tw/
target_stack: static HTML/CSS served by Node
output: DESIGN.md and index.html
