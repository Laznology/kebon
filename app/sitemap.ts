import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl: string =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

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

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  const dynamicPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...dynamicPages]
}