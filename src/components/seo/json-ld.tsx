/**
 * JSON-LD structured data component.
 * Usage: <JsonLd data={schemaObject} />
 * Renders a <script type="application/ld+json"> tag in the document head area.
 * Safe to use in Server Components.
 */
interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
