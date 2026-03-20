import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  endValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: "number" | "lakh" | "thousand";
  className?: string;
}

export function AnimatedCounter({
  endValue,
  duration = 2000,
  prefix = "",
  suffix = "",
  format = "number",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - easeOutExpo for snappy feel
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutExpo);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  };

  // Format display value based on format type
  const formatValue = (val: number): string => {
    if (format === "lakh") {
      // Display as X.XL (e.g., 140000 -> 1.4L)
      const lakhs = val / 100000;
      return lakhs % 1 === 0 ? `${lakhs}L` : `${lakhs.toFixed(1)}L`;
    }
    if (format === "thousand") {
      // Display as XK (e.g., 5000 -> 5K)
      const thousands = val / 1000;
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return val.toLocaleString('en-IN');
  };

  return (
    <span ref={ref} className={className}>
      {prefix}{formatValue(count)}{suffix}
    </span>
  );
}

interface ParsedStat {
  numeric: number;
  prefix: string;
  suffix: string;
  format: "number" | "lakh" | "thousand";
}

// Parse stat value like "170+" or "₹1.4L+" into numeric and suffix
export function parseStatValue(value: string): ParsedStat {
  // Handle currency prefix
  const currencyMatch = value.match(/^(₹|Rs\.?|INR\s*)/i);
  const prefix = currencyMatch ? currencyMatch[1] : "";
  const valueWithoutPrefix = prefix ? value.slice(prefix.length) : value;
  
  // Handle L (lakh) notation - keep as lakh format
  const lakhMatch = valueWithoutPrefix.match(/^([\d.]+)L\+?$/i);
  if (lakhMatch) {
    return {
      numeric: parseFloat(lakhMatch[1]) * 100000,
      prefix,
      suffix: "+",
      format: "lakh",
    };
  }
  
  // Handle K notation - keep as thousand format
  const kMatch = valueWithoutPrefix.match(/^([\d.]+)K\+?$/i);
  if (kMatch) {
    return {
      numeric: parseFloat(kMatch[1]) * 1000,
      prefix,
      suffix: "+",
      format: "thousand",
    };
  }
  
  // Handle regular numbers with + suffix
  const plusMatch = valueWithoutPrefix.match(/^([\d,]+)\+$/);
  if (plusMatch) {
    return {
      numeric: parseInt(plusMatch[1].replace(/,/g, ""), 10),
      prefix,
      suffix: "+",
      format: "number",
    };
  }
  
  // Plain number
  const plainMatch = valueWithoutPrefix.match(/^([\d,]+)$/);
  if (plainMatch) {
    return {
      numeric: parseInt(plainMatch[1].replace(/,/g, ""), 10),
      prefix,
      suffix: "",
      format: "number",
    };
  }
  
  // Fallback - return as-is, won't animate
  return { numeric: 0, prefix: "", suffix: value, format: "number" };
}
