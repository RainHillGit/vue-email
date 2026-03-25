declare module '@react-email/render' {
  export function render(
    component: React.ReactNode,
    options?: {
      pretty?: boolean
      plainText?: boolean
    }
  ): Promise<string>
}
