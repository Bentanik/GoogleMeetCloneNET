"use client"

import { forwardRef } from "react"

const Title = forwardRef<HTMLHeadingElement, { children: React.ReactNode }>(
    ({ children }, ref) => (
        <h2 ref={ref} className="text-3xl md:text-4xl font-extrabold text-balance bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 tracking-tight">
            {children}
        </h2>
    )
)

Title.displayName = "Title"

export default Title


