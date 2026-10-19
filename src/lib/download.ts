const PDF_NAME = 'Mehedi_Hasan_Resume.pdf';

/**
 * Serves public/Mehedi_Hasan_Resume.pdf when it exists; otherwise opens the browser's
 * print dialog on the plain print layout so the visitor can save it as a PDF.
 */
export async function downloadResume(): Promise<void> {
  const url = `${import.meta.env.BASE_URL}${PDF_NAME}`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    // The dev server answers unknown paths with index.html, so check the type too.
    if (res.ok && res.headers.get('content-type')?.includes('pdf')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = PDF_NAME;
      link.click();
      return;
    }
  } catch {
    // Offline or blocked: fall through to printing.
  }

  // The print dialog suggests the document title as the file name.
  const previousTitle = document.title;
  document.title = PDF_NAME.replace('.pdf', '');
  window.print();
  document.title = previousTitle;
}
