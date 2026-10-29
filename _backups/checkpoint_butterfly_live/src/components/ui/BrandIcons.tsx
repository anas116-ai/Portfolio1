"use client";

/* Official brand marks with authentic brand colors.
   GitHub: Official #24292F dark plate with crisp white Octocat mark.
   LinkedIn: Official LinkedIn brand blue #0A66C2 plate with crisp white "in". */

export function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none drop-shadow-sm"
    >
      <rect
        width="24"
        height="24"
        rx="5"
        fill="#24292F"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.75"
      />
      <g transform="translate(2.5 2.5) scale(0.7916)">
        <path
          fill="#FFFFFF"
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        />
      </g>
    </svg>
  );
}

export function LinkedinMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none drop-shadow-sm"
    >
      <rect
        width="24"
        height="24"
        rx="5"
        fill="#0A66C2"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.75"
      />
      <path
        fill="#FFFFFF"
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.99 0 1.8-.81 1.8-1.8s-.81-1.8-1.8-1.8a1.8 1.8 0 0 0-1.8 1.8c0 .99.81 1.8 1.8 1.8m1.4 10.74v-8.37H5.06v8.37h2.8z"
        transform="translate(1.5, 1.5) scale(0.875)"
      />
    </svg>
  );
}
