import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Signal Board buttons: solid square blocks. The main action ("default") is the light-grey
// accent whose hover is a dither of lit pixels; everything else is a grey fill.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border-0 font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "sb-accent",
        secondary: "bg-chip text-ink hover:bg-chip-hover aria-expanded:bg-chip-hover",
        outline: "bg-chip text-ink hover:bg-chip-hover aria-expanded:bg-chip-hover",
        ghost: "bg-transparent text-ink-2 hover:bg-chip hover:text-ink aria-expanded:bg-chip",
        destructive: "bg-[color-mix(in_srgb,var(--sb-red)_16%,transparent)] text-[var(--sb-red-ink)] hover:bg-[color-mix(in_srgb,var(--sb-red)_24%,transparent)]",
        link: "bg-transparent px-0 text-ink underline decoration-sep underline-offset-[3px] hover:decoration-ink",
      },
      size: {
        default: "h-[38px] px-4 text-[14px]",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[30px] gap-1.5 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[42px] px-5 text-[14.5px]",
        icon: "size-[38px]",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[30px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-[42px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
