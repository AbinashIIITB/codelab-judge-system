import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-[#0056b3] text-white hover:bg-[#004494]',
                destructive:
                    'bg-red-600 text-white hover:bg-red-700',
                outline:
                    'border border-[#CCCCCC] bg-white hover:bg-[#F0F0F0] text-[#333333]',
                secondary:
                    'bg-[#E1E1E1] text-[#333333] hover:bg-[#D1D1D1]',
                ghost: 'hover:bg-[#F0F0F0]',
                link: 'text-[#0056b3] underline-offset-4 hover:underline',
                success: 'bg-green-600 text-white hover:bg-green-700',
            },
            size: {
                default: 'h-8 px-4 py-1',
                sm: 'h-7 px-3 text-xs',
                lg: 'h-10 px-8',
                icon: 'h-8 w-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
