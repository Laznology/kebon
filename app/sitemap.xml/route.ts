import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.5',
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.5',
    },
  ]

  let dynamicUrls: Array<{ url: string; lastModified: string; changefreq: string; priority: string }> = []

  try {
    if (process.env.DATABASE_URL) {
      const pages = await prisma.page.findMany({
        where: {
          published: true,
          isDeleted: false,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      dynamicUrls = pages.map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: '0.8',
      }))
    }
  } catch (error) {
    console.warn('Failed to fetch pages for sitemap:', error)
  }

  const allUrls = [...staticUrls, ...dynamicUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastModified, changefreq, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  })
}