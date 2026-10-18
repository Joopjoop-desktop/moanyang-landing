import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'light' | 'accent' | 'disabled';
type Size = 'sm' | 'md';

type Common = { variant?: Variant; size?: Size; block?: boolean };

function cx(variant: Variant, size: Size, block?: boolean, extra?: string) {
  return [styles.button, styles[variant], styles[size], block && styles.block, extra].filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'sm',
  block,
  className,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(rest.disabled ? 'disabled' : variant, size, block, className)} {...rest} />;
}

export function ButtonLink({
  variant = 'primary',
  size = 'sm',
  block,
  className,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cx(variant, size, block, className)} {...rest} />;
}
