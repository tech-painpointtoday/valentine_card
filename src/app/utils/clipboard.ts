export function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => fallbackCopyToClipboard(text));
  }
  
  // Use fallback method
  return Promise.resolve(fallbackCopyToClipboard(text));
}

function fallbackCopyToClipboard(text: string): boolean {
  // Create a temporary textarea element
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make it invisible but still accessible
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    document.body.removeChild(textArea);
    return false;
  }
}
