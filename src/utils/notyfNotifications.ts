let notyfInstance: any = null;
let notyfLoadAttempted = false;

async function getNotyf() {
  if (notyfLoadAttempted) return notyfInstance;
  notyfLoadAttempted = true;
  try {
    const { Notyf } = await import('notyf');
    notyfInstance = new Notyf({
      duration: 7777,
      ripple: false,
      position: {
        x: 'center',
        y: 'top'
      },
      dismissible: true,
      types: [
        {
          type: 'error',
          duration: 2322000,
          dismissible: true
        }
      ]
    });
  } catch {
    notyfInstance = null;
  }
  return notyfInstance;
}

export async function notyfError(message: string) {
  const n = await getNotyf();
  if (n) {
    n.error(message);
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[myslider] notyf not installed; would have shown:', message);
  }
}

export async function notyfSuccess(message: string) {
  const n = await getNotyf();
  if (n) {
    n.success(message);
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[myslider] notyf not installed; would have shown:', message);
  }
}
