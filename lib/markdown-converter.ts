import { generateHTML } from '@tiptap/html'
import { defaultExtensions } from './extensions'
import TurndownService from 'turndown'

/**
 * Convert Novel.sh JSON content to HTML
 */
export function convertNovelToHTML(content: any): string {
  if (!content || !content.blocks) {
    return ''
  }

  try {
    // Convert Novel.sh blocks format to Tiptap JSON format
    const tiptapContent = convertNovelBlocksToTiptap(content.blocks)
    
    // Generate HTML from Tiptap JSON
    return generateHTML(tiptapContent, defaultExtensions)
  } catch (error) {
    console.error('Error converting Novel content to HTML:', error)
    return ''
  }
}

/**
 * Convert Novel.sh blocks to Tiptap JSON format
 */
function convertNovelBlocksToTiptap(blocks: any[]): any {
  const content = blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return {
          type: 'paragraph',
          content: parseInlineContent(block.data?.text || '')
        }
      
      case 'header':
      case 'heading':
        return {
          type: 'heading',
          attrs: { level: block.data?.level || 1 },
          content: parseInlineContent(block.data?.text || '')
        }
      
      case 'list':
        return {
          type: block.data?.style === 'ordered' ? 'orderedList' : 'bulletList',
          content: block.data?.items?.map((item: any) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: parseInlineContent(typeof item === 'string' ? item : item.content || item.text || '')
              }
            ]
          })) || []
        }
      
      case 'nestedlist':
        return convertNestedList(block.data)
      
      case 'checklist':
        return {
          type: 'taskList',
          content: block.data?.items?.map((item: any) => ({
            type: 'taskItem',
            attrs: { checked: item.checked || false },
            content: [
              {
                type: 'paragraph',
                content: parseInlineContent(item.text || '')
              }
            ]
          })) || []
        }
      
      case 'code':
        return {
          type: 'codeBlock',
          attrs: { language: block.data?.language || null },
          content: [
            {
              type: 'text',
              text: block.data?.code || ''
            }
          ]
        }
      
      case 'raw':
        return {
          type: 'codeBlock',
          attrs: { language: 'html' },
          content: [
            {
              type: 'text',
              text: block.data?.html || ''
            }
          ]
        }
      
      case 'image':
        return {
          type: 'image',
          attrs: {
            src: block.data?.file?.url || block.data?.url || '',
            alt: block.data?.caption || block.data?.alt || '',
            title: block.data?.caption || block.data?.title || ''
          }
        }
      
      case 'embed':
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `[Embedded content: ${block.data?.service || 'Unknown'} - ${block.data?.source || block.data?.embed || ''}]`
            }
          ]
        }
      
      case 'linkTool':
        const linkUrl = block.data?.link || ''
        const linkText = block.data?.meta?.title || block.data?.meta?.description || linkUrl
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: linkText,
              marks: linkUrl ? [{ type: 'link', attrs: { href: linkUrl } }] : []
            }
          ]
        }
      
      case 'quote':
      case 'blockquote':
        return {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: parseInlineContent(block.data?.text || '')
            },
            ...(block.data?.caption ? [{
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `— ${block.data.caption}`,
                  marks: [{ type: 'italic' }]
                }
              ]
            }] : [])
          ]
        }
      
      case 'warning':
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `⚠️ ${block.data?.title || ''}: ${block.data?.message || ''}`,
              marks: [{ type: 'bold' }]
            }
          ]
        }
      
      case 'delimiter':
        return {
          type: 'horizontalRule'
        }
      
      case 'table':
        return convertTable(block.data)
      
      default:
        // Fallback to paragraph for unknown types
        const fallbackText = extractTextFromBlock(block)
        return {
          type: 'paragraph',
          content: parseInlineContent(fallbackText)
        }
    }
  }).filter(Boolean) // Remove null/undefined blocks

  return {
    type: 'doc',
    content
  }
}

/**
 * Parse inline content with formatting (bold, italic, links, etc.)
 * This handles HTML-like markup that might come from Novel.sh editor
 */
function parseInlineContent(text: string): any[] {
  if (!text) return [{ type: 'text', text: '' }]
  
  // If it's plain text without any markup, return as simple text
  if (!/<[^>]+>/.test(text)) {
    return [{ type: 'text', text: text }]
  }
  
  // Parse HTML-like content and convert to Tiptap nodes
  const result: any[] = []
  let currentPos = 0
  
  // Simple regex patterns for common formatting
  const patterns = [
    { regex: /<strong[^>]*>(.*?)<\/strong>/gi, type: 'bold' },
    { regex: /<b[^>]*>(.*?)<\/b>/gi, type: 'bold' },
    { regex: /<em[^>]*>(.*?)<\/em>/gi, type: 'italic' },
    { regex: /<i[^>]*>(.*?)<\/i>/gi, type: 'italic' },
    { regex: /<u[^>]*>(.*?)<\/u>/gi, type: 'underline' },
    { regex: /<code[^>]*>(.*?)<\/code>/gi, type: 'code' },
    { regex: /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, type: 'link' }
  ]
  
  // For now, return simple text processing
  // In a more sophisticated implementation, you would parse the HTML properly
  const cleanText = text
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
  
  return [{ type: 'text', text: cleanText }]
}

/**
 * Convert nested list structure
 */
function convertNestedList(data: any): any {
  if (!data?.items) return null
  
  return {
    type: data.style === 'ordered' ? 'orderedList' : 'bulletList',
    content: data.items.map((item: any) => ({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: parseInlineContent(item.content || item.text || '')
        },
        ...(item.items ? [convertNestedList({ items: item.items, style: data.style })] : [])
      ]
    }))
  }
}

/**
 * Convert table structure
 */
function convertTable(data: any): any {
  if (!data?.content) return null
  
  return {
    type: 'table',
    content: data.content.map((row: any[]) => ({
      type: 'tableRow',
      content: row.map((cell: string) => ({
        type: 'tableCell',
        content: [
          {
            type: 'paragraph',
            content: parseInlineContent(cell || '')
          }
        ]
      }))
    }))
  }
}

/**
 * Extract text content from any block type
 */
function extractTextFromBlock(block: any): string {
  if (block.data?.text) return block.data.text
  if (block.data?.content) return block.data.content
  if (block.data?.message) return block.data.message
  if (block.data?.title) return block.data.title
  if (block.data?.caption) return block.data.caption
  if (typeof block.data === 'string') return block.data
  
  // Try to stringify complex objects
  try {
    return JSON.stringify(block.data)
  } catch {
    return '[Complex content]'
  }
}

/**
 * Simple HTML to Markdown converter
 * For more advanced conversion, consider using turndown.js
 */
export function htmlToMarkdown(html: string): string {
  return html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    
    // Bold and Italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n'
    })
    
    // Lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n'
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n'
    })
    
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // Line breaks
    .replace(/<br[^>]*>/gi, '\n')
    
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Main function to convert Novel.sh content to Markdown using Turndown
 */
export function convertNovelToMarkdown(content: any): string {
  try {
    // If it's already in Novel.sh blocks format, convert directly
    if (content?.blocks && Array.isArray(content.blocks)) {
      return convertNovelBlocksToMarkdown(content.blocks)
    }
    
    // If it's Tiptap/ProseMirror JSON, convert via HTML
    if (content?.type === 'doc' || content?.content) {
      const html = generateHTML(content, defaultExtensions)
      return convertHTMLToMarkdown(html)
    }
    
    // If it's plain HTML string
    if (typeof content === 'string' && content.includes('<')) {
      return convertHTMLToMarkdown(content)
    }
    
    // If it's plain text
    if (typeof content === 'string') {
      return content
    }
    
    // Fallback: try to convert via HTML
    const html = convertNovelToHTML(content)
    if (html) {
      return convertHTMLToMarkdown(html)
    }
    
    return ''
  } catch (error) {
    console.error('Error converting Novel content to Markdown:', error)
    
    // Fallback to simple block conversion if available
    if (content?.blocks) {
      try {
        return convertNovelBlocksToMarkdown(content.blocks)
      } catch (fallbackError) {
        console.error('Fallback conversion also failed:', fallbackError)
        return ''
      }
    }
    
    return ''
  }
}

/**
 * Convert HTML to Markdown using Turndown with better configuration
 */
function convertHTMLToMarkdown(html: string): string {
  // Initialize Turndown service with optimal settings
  const turndownService = new TurndownService({
    headingStyle: 'atx', // Use # for headings
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full'
  })
  
  // Add custom rules for better conversion
  turndownService.addRule('lineBreak', {
    filter: 'br',
    replacement: () => '\n'
  })
  
  // Handle task lists
  turndownService.addRule('taskList', {
    filter: function (node) {
      return node.nodeName === 'LI' && 
             node.querySelector('input[type="checkbox"]') !== null
    },
    replacement: function (content, node) {
      const checkbox = node.querySelector('input[type="checkbox"]')
      const checked = checkbox && checkbox.checked ? 'x' : ' '
      return `- [${checked}] ${content.trim()}\n`
    }
  })
  
  // Handle images with better alt text
  turndownService.addRule('images', {
    filter: 'img',
    replacement: function (content, node) {
      const alt = node.getAttribute('alt') || ''
      const src = node.getAttribute('src') || ''
      const title = node.getAttribute('title')
      
      if (title) {
        return `![${alt}](${src} "${title}")`
      }
      return `![${alt}](${src})`
    }
  })
  
  // Handle code blocks with language detection
  turndownService.addRule('codeBlocks', {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.querySelector('code')
    },
    replacement: function (content, node) {
      const code = node.querySelector('code')
      const language = code ? extractLanguageFromClass(code.className) : ''
      const codeContent = code ? code.textContent || '' : content
      
      return `\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`
    }
  })
  
  // Convert HTML to Markdown
  return turndownService.turndown(html)
}

/**
 * Extract programming language from CSS class names
 */
function extractLanguageFromClass(className: string): string {
  if (!className) return ''
  
  // Common patterns for language classes
  const patterns = [
    /language-(\w+)/,
    /lang-(\w+)/,
    /hljs-(\w+)/,
    /(\w+)-code/
  ]
  
  for (const pattern of patterns) {
    const match = className.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return ''
}

/**
 * Alternative simple conversion for basic content
 */
export function convertNovelBlocksToMarkdown(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) {
    return ''
  }

  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return `${block.data?.text || ''}\n\n`
      
      case 'header':
      case 'heading':
        const level = '#'.repeat(Math.min(block.data?.level || 1, 6))
        return `${level} ${block.data?.text || ''}\n\n`
      
      case 'list':
        if (!block.data?.items) return ''
        const items = block.data.items.map((item: any, index: number) => {
          const content = typeof item === 'string' ? item : item.content || item.text || ''
          if (block.data?.style === 'ordered') {
            return `${index + 1}. ${content}`
          }
          return `- ${content}`
        }).join('\n')
        return `${items}\n\n`
      
      case 'nestedlist':
        return convertNestedListToMarkdown(block.data, 0)
      
      case 'checklist':
        if (!block.data?.items) return ''
        const checkItems = block.data.items.map((item: any) => {
          const checked = item.checked ? 'x' : ' '
          const text = item.text || ''
          return `- [${checked}] ${text}`
        }).join('\n')
        return `${checkItems}\n\n`
      
      case 'code':
        const language = block.data?.language || ''
        const code = block.data?.code || ''
        return `\`\`\`${language}\n${code}\n\`\`\`\n\n`
      
      case 'raw':
        const html = block.data?.html || ''
        return `\`\`\`html\n${html}\n\`\`\`\n\n`
      
      case 'image':
        const url = block.data?.file?.url || block.data?.url || ''
        const caption = block.data?.caption || block.data?.alt || ''
        return `![${caption}](${url})\n\n`
      
      case 'embed':
        const service = block.data?.service || 'Unknown'
        const source = block.data?.source || block.data?.embed || ''
        return `> **Embedded ${service}**: [${source}](${source})\n\n`
      
      case 'linkTool':
        const linkUrl = block.data?.link || ''
        const linkTitle = block.data?.meta?.title || 'Link'
        const linkDesc = block.data?.meta?.description || ''
        return `### [${linkTitle}](${linkUrl})\n${linkDesc ? `${linkDesc}\n` : ''}\n`
      
      case 'quote':
      case 'blockquote':
        const quoteText = block.data?.text || ''
        const quoteCitation = block.data?.caption ? `\n> \n> — ${block.data.caption}` : ''
        return `> ${quoteText}${quoteCitation}\n\n`
      
      case 'warning':
        const warningTitle = block.data?.title || 'Warning'
        const warningMessage = block.data?.message || ''
        return `> ⚠️ **${warningTitle}**: ${warningMessage}\n\n`
      
      case 'delimiter':
        return '---\n\n'
      
      case 'table':
        return convertTableToMarkdown(block.data)
      
      case 'attaches':
        const fileTitle = block.data?.title || 'Attachment'
        const fileUrl = block.data?.file?.url || ''
        return `📎 [${fileTitle}](${fileUrl})\n\n`
      
      default:
        // Try to extract text from unknown block types
        const fallbackText = extractTextFromBlock(block)
        return fallbackText ? `${fallbackText}\n\n` : ''
    }
  }).join('')
}

/**
 * Convert nested list to markdown with proper indentation
 */
function convertNestedListToMarkdown(data: any, depth: number = 0): string {
  if (!data?.items) return ''
  
  const indent = '  '.repeat(depth)
  const items = data.items.map((item: any, index: number) => {
    const content = item.content || item.text || ''
    let result = ''
    
    if (data.style === 'ordered') {
      result = `${indent}${index + 1}. ${content}`
    } else {
      result = `${indent}- ${content}`
    }
    
    // Handle nested items
    if (item.items && item.items.length > 0) {
      result += '\n' + convertNestedListToMarkdown({ items: item.items, style: data.style }, depth + 1)
    }
    
    return result
  }).join('\n')
  
  return `${items}\n\n`
}

/**
 * Convert table to markdown format
 */
function convertTableToMarkdown(data: any): string {
  if (!data?.content || !Array.isArray(data.content)) return ''
  
  const rows = data.content as string[][]
  if (rows.length === 0) return ''
  
  // Create header row
  const headerRow = rows[0]
  const header = `| ${headerRow.join(' | ')} |`
  const separator = `| ${headerRow.map(() => '---').join(' | ')} |`
  
  // Create data rows
  const dataRows = rows.slice(1).map(row => 
    `| ${row.join(' | ')} |`
  ).join('\n')
  
  return `${header}\n${separator}\n${dataRows}\n\n`
}
