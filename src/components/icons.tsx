type IconProps = { className?: string };

export function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2C9.5 20 4 14.5 4 7a2 2 0 0 1 1-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 3l18 18M10.6 5.2c.45-.1.92-.2 1.4-.2 6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"
        fill="currentColor"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 554 554" fill="currentColor" fillRule="evenodd" className={className}>
      <path d="M 379.048 73.750 C 370.962 95.435, 364.743 108.499, 356.715 120.670 C 340.220 145.677, 316.771 167.691, 288.500 184.710 C 273.553 193.709, 267.121 196.710, 236.604 208.929 C 192.449 226.608, 168.425 239.287, 146.610 256.424 C 107.292 287.311, 85.114 327.770, 80.048 377.856 C 79.471 383.552, 79.039 390.752, 79.086 393.856 C 79.170 399.350, 79.235 399.210, 81.555 388.556 C 90.851 345.877, 110.997 311.103, 139.962 287.741 C 164.632 267.845, 192.481 254.548, 239 240.455 C 250.825 236.873, 267.025 231.679, 275 228.913 C 301.932 219.573, 330.039 204.026, 351.978 186.336 C 367.769 173.603, 388.521 150.937, 396.985 137.179 C 398.786 134.253, 400.586 132.228, 400.986 132.679 C 413.289 146.570, 428.099 180.300, 432.959 205.500 C 444.684 266.298, 426.388 341.973, 389.434 385.534 C 364.935 414.414, 328.022 431.525, 275.258 438.461 C 260.025 440.464, 236.749 441.823, 197.500 443 C 178.800 443.562, 159.482 444.312, 154.570 444.667 L 145.640 445.314 147.737 442.407 C 150.791 438.172, 163.360 425.555, 172.892 417.156 C 188.433 403.461, 199.123 396.005, 262.198 354.867 C 291.946 335.465, 308.901 322.564, 325.938 306.363 C 354.395 279.306, 373.075 249.868, 380.592 220.236 C 383.420 209.089, 383.635 205.673, 381.111 212 C 367.582 245.918, 340.747 276.495, 302 302.144 C 287.899 311.479, 264.200 324.727, 232.500 340.997 C 169.964 373.093, 143.671 390.763, 117.110 418.547 C 101.456 434.921, 92.790 447.639, 78.986 474.500 C 73.898 484.400, 69.143 493.461, 68.419 494.635 C 67.696 495.810, 67.286 496.952, 67.508 497.175 C 67.730 497.397, 79.069 496.119, 92.706 494.335 C 129.376 489.539, 142.507 488.929, 205 489.125 C 265.002 489.313, 277.399 488.671, 305.322 483.934 C 371.580 472.693, 418.687 442.094, 449.164 390.500 C 472.782 350.519, 486.952 297.831, 486.989 249.856 C 487.044 179.779, 459.635 118.357, 408.554 74.086 C 397.061 64.126, 387.783 57, 386.307 57 C 385.750 57, 382.484 64.537, 379.048 73.750" />
    </svg>
  );
}

export function IconMedal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 2l2.2 7M16 2l-2.2 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 12.3l1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconGrain({ className }: IconProps) {
  return (
    <svg viewBox="0 0 260 230" fill="currentColor" fillRule="evenodd" className={className}>
      <path d="M 98.360 69.318 C 84.192 79.759, 72.449 97.660, 67.035 117.067 C 65.894 121.155, 64.461 129.900, 63.851 136.500 C 62.540 150.663, 64.026 161.951, 68.426 171.252 C 80.548 196.877, 114.759 202.751, 133.914 182.497 C 143.350 172.520, 146.526 163.015, 146.441 145 C 146.349 125.244, 140.624 107.117, 129.134 90.197 C 122.240 80.045, 107.859 65, 105.049 65 C 104.593 65, 101.583 66.943, 98.360 69.318 M 99.673 90.750 C 92.693 109.531, 89.945 121.399, 89.309 135.500 C 88.276 158.417, 94.505 180.699, 103.613 186.666 C 105.956 188.201, 106.505 188.227, 108.850 186.911 C 115.429 183.218, 120.028 167.187, 120.766 145.378 C 121.333 128.626, 119.567 118.589, 112.345 97.532 C 109.887 90.364, 107.378 83.037, 106.770 81.250 C 106.162 79.463, 105.383 78, 105.038 78 C 104.693 78, 102.279 83.737, 99.673 90.750 M 92.323 84.250 C 72.985 104.728, 64.424 145.368, 74.648 168.151 C 77.357 174.187, 84.146 181.473, 89.773 184.383 L 92.860 185.979 89.543 178.740 C 85.191 169.241, 82.963 159.026, 82.278 145.422 C 81.433 128.657, 84.832 110.093, 92.455 89.838 C 94.284 84.977, 95.694 81, 95.587 81 C 95.480 81, 94.011 82.463, 92.323 84.250 M 119.679 97.096 C 126.742 118.459, 128.291 127.847, 127.666 145.500 C 127.117 160.961, 125.228 172.339, 121.977 179.750 C 120.951 182.088, 120.400 184, 120.752 184 C 122.540 184, 129.099 178.390, 131.946 174.426 C 137.724 166.380, 139.381 160.098, 139.444 146 C 139.507 131.922, 137.873 123.700, 132.439 110.752 C 129.357 103.409, 119.647 87.612, 116.725 85.187 C 115.967 84.557, 117.266 89.797, 119.679 97.096 M 170.193 86.011 C 161.740 87.191, 153.902 89.502, 145.750 93.219 C 140.166 95.765, 139 96.708, 139 98.679 C 139 99.990, 139.643 101.309, 140.428 101.611 C 141.213 101.912, 145.832 100.568, 150.693 98.623 C 158.159 95.636, 175.796 91.462, 176.783 92.449 C 176.949 92.616, 174.254 94.226, 170.793 96.026 C 161.961 100.620, 147.555 109.626, 145.956 111.553 C 144.448 113.370, 145.664 116.293, 148.132 116.780 C 148.911 116.934, 153.331 114.572, 157.952 111.531 C 170.300 103.407, 186.510 95.245, 185.566 97.627 C 185.158 98.657, 183.693 102.650, 182.311 106.500 C 178.599 116.842, 167.882 138.811, 163.146 145.786 C 160.871 149.134, 156.533 154.550, 153.505 157.821 C 147.565 164.237, 147.197 165.089, 149.530 167.025 C 151.979 169.058, 155.174 166.915, 162.144 158.563 C 170.049 149.091, 177.543 136.065, 184.180 120.260 C 187.012 113.515, 189.510 108.177, 189.731 108.398 C 189.952 108.618, 189.658 113.048, 189.079 118.242 C 186.548 140.939, 177.371 160.823, 162.920 174.920 C 155.990 181.680, 148.327 185.698, 139.144 187.387 C 133.722 188.384, 132.445 188.983, 132.202 190.642 C 131.659 194.345, 134.256 195.344, 141.234 194.119 C 150.199 192.546, 159.145 187.771, 166.981 180.379 C 183.623 164.680, 193.501 143.398, 196.116 117.612 C 197.382 105.127, 196.233 89.800, 193.853 87.430 C 192.095 85.680, 178.439 84.861, 170.193 86.011" />
    </svg>
  );
}

export function IconWrench({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.8 2.8-2.5-.5-.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 3h8l10 10-8 8L3 11V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
