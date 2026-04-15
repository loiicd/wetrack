declare module "class-variance-authority" {
  export function cva(base?: any, options?: any): (...args: any[]) => string;
  export type VariantProps<T = any> = any;
}
