import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-[#D6B79A]/55 focus-visible:border-[#D6A373] focus-visible:ring-[#B6885E]/35 aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border border-[#B6885E]/35 bg-[#120D09]/75 px-3 py-2 text-base text-[#F5E6D8] shadow-[inset_0_1px_0_rgba(245,230,216,0.04)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:border-[#B6885E]/15 disabled:bg-[#15100B]/55 disabled:text-[#B79B85]/45 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
