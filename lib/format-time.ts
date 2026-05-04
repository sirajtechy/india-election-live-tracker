/**
 * Format an ISO instant for India elections context (IST), independent of the viewer's browser timezone.
 */
export function formatIndiaDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(d) + ' IST'
    );
  } catch {
    return iso;
  }
}
