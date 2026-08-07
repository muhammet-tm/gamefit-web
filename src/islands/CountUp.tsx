import { useEffect, useRef, useState } from 'react';

interface Props { value: string; }

export default function CountUp({ value }: Props) {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const prefix = match?.[1] ?? '';
  const target = match ? parseFloat(match[2]) : NaN;
  const suffix = match?.[3] ?? '';
  const decimals = match?.[2].includes('.') ? 1 : 0;

  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (Number.isNaN(target) || done.current || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done.current) return;
      done.current = true;
      observer.disconnect();

      const duration = 600;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(prefix + (target * eased).toFixed(decimals) + suffix);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      setDisplay(prefix + (0).toFixed(decimals) + suffix);
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, prefix, suffix, decimals, value]);

  return <span ref={ref}>{display}</span>;
}
