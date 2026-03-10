export function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return Promise.resolve(false);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    ta.remove();
  }

  return Promise.resolve(ok);
}

