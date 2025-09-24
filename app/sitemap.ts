import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 

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

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ]

  const dynamicPages = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...dynamicPages]
}