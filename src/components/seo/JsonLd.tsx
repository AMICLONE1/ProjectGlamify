// Renders a JSON-LD <script> for structured data. Server-safe, no client JS.
// Usage: <JsonLd data={organizationSchema()} />  or  <JsonLd data={[a, b]} />

export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; we escape "<" to avoid breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}
