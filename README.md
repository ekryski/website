# My Website

My website uses the Spotlight theme from [Tailwind UI](https://tailwindui.com) built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

To get started developing and building, first install the npm dependencies:

```bash
npm install
```

Next, create a `.env.local` file in the root of your project and set the `NEXT_PUBLIC_SITE_URL` variable to your site's public URL:

```
NEXT_PUBLIC_SITE_URL=https://example.com
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Building

The production build includes feed generation, CV PDF generation, and static export. Run `npm run build` to build the site. Requires `NEXT_PUBLIC_SITE_URL` (e.g. `https://erickryski.com`).

## Deployment (GitHub Pages)

1. In repo **Settings > Pages**: set Source to "GitHub Actions"
2. In **Settings > Secrets and variables > Actions**: add repository variable `NEXT_PUBLIC_SITE_URL` = `https://erickryski.com`
3. Push to `main` to trigger deploy

## Releases

- `npm run release` - bump version from conventional commits
- `npm run release:patch` / `release:minor` / `release:major` - bump specific version
- Push with `git push --follow-tags` to create GitHub Release

## Home page photos

The five photos on the home page are sourced from `planning/resources/` (eric-*.jpeg). To regenerate optimized versions after adding or replacing source images, run:

```bash
npm run optimize-home-photos
```

This resizes images to 600px max width and outputs JPEG at 80% quality to `src/images/photos/`. Current photos: hiking, golf, mountain, Ray Dalio, snowboarding (image-1 through image-5).

## Newsletter
    
The newsletter subscription form is integrated with [Kit](https://kit.com) (formerly ConvertKit). It uses a standard HTML form submission to the Kit API.

To update the form configuration:
1. Go to `src/app/page.tsx`
2. Update the `action` attribute in the `<form>` tag with your Kit form URL (e.g., `https://app.kit.com/forms/YOUR_FORM_ID/subscriptions`)
3. Ensure the input name is `email_address`

## Customizing

You can edit the website by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

## License

This site template from TailwindUI was paid for and is a commercial product licensed under the [Tailwind UI license](https://tailwindui.com/license). It cannot and should not be replicated without paying for the license yourself.

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [MDX](https://mdxjs.com) - the MDX documentation
