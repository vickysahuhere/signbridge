import React from 'react';

/**
 * OtterLogoIcon
 * The official website logo for Sanket ISL.
 * Features the adorable Otter companion in natural warm chocolate/cream colors,
 * greeting users with authentic ISL Namaste prayer paws.
 */
export function OtterLogoIcon({ className = 'w-8 h-8', showNamaste = true }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sanket Otter Logo"
      role="img"
    >
      <defs>
        {/* Natural Otter Coat Gradient */}
        <linearGradient id="otterLogoFur" x1="50%" y1="10%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E6439" />
          <stop offset="48%" stopColor="#844F27" />
          <stop offset="100%" stopColor="#643613" />
        </linearGradient>

        {/* Natural Otter Cream Throat & Bib */}
        <linearGradient id="otterLogoBib" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FFF4DF" />
          <stop offset="100%" stopColor="#F5DFBD" />
        </linearGradient>
      </defs>

      {/* Cute Curved Otter Tail on Lower Right */}
      <path
        d="M 112 108 C 128 110, 142 116, 144 125 C 145 132, 137 137, 126 135 C 115 133, 106 124, 104 118 Z"
        fill="#522C0E"
        stroke="#18181B"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Otter Ears (Cute rounded ears) */}
      <g>
        <path
          d="M 43 49 C 34 44, 34 29, 47 32 C 55 35, 57 47, 52 54 Z"
          fill="#7A451E"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M 42 46 C 37 42, 38 34, 46 36 C 50 37, 51 43, 47 48 Z" fill="#FCE2C4" />
      </g>
      <g>
        <path
          d="M 117 49 C 126 44, 126 29, 113 32 C 105 35, 103 47, 108 54 Z"
          fill="#7A451E"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M 118 46 C 123 42, 122 34, 114 36 C 110 37, 109 43, 113 48 Z" fill="#FCE2C4" />
      </g>

      {/* Plump Otter Body */}
      <ellipse cx="80" cy="98" rx="43" ry="44" fill="#18181B" />
      <ellipse cx="80" cy="94" rx="43" ry="43" fill="#522C0E" />
      <ellipse cx="80" cy="90" rx="43" ry="42" fill="url(#otterLogoFur)" stroke="#18181B" strokeWidth="2.8" />

      {/* Cream Belly & Chest Fur */}
      <path
        d="M 60 82 C 60 76, 100 76, 100 82 C 108 94, 106 117, 98 124 C 90 130, 70 130, 62 124 C 54 117, 52 94, 60 82 Z"
        fill="url(#otterLogoBib)"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M 74 108 C 77 111, 83 111, 86 108" stroke="#E2BF95" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 72 117 C 76 121, 84 121, 88 117" stroke="#E2BF95" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Otter Head */}
      <ellipse cx="80" cy="65" rx="39" ry="33" fill="#18181B" />
      <ellipse cx="80" cy="63" rx="39" ry="32" fill="#5A3110" />
      <ellipse cx="80" cy="61" rx="39" ry="31" fill="url(#otterLogoFur)" stroke="#18181B" strokeWidth="2.8" />
      <ellipse cx="80" cy="46" rx="18" ry="9" fill="#B37542" opacity="0.6" />

      {/* Adorable Broad Otter Muzzle */}
      <path
        d="M 54 66 C 54 55, 66 52, 75 56 C 77 57, 83 57, 85 56 C 94 52, 106 55, 106 66 C 108 79, 96 85, 80 85 C 64 85, 52 79, 54 66 Z"
        fill="url(#otterLogoBib)"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Rosy Blushing Cheeks */}
      <ellipse cx="49" cy="69" rx="6.5" ry="4.5" fill="#FFA58C" opacity="0.85" />
      <ellipse cx="111" cy="69" rx="6.5" ry="4.5" fill="#FFA58C" opacity="0.85" />

      {/* Sparkling Expressive Otter Eyes */}
      <ellipse cx="58" cy="53" rx="12.5" ry="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="60.5" cy="53" rx="8" ry="9.5" fill="#29180E" />
      <ellipse cx="61" cy="54" rx="5" ry="6.5" fill="#140A04" />
      <circle cx="58" cy="49" r="3.4" fill="#FFFFFF" />
      <circle cx="63.5" cy="56.5" r="1.5" fill="#FFFFFF" />

      <ellipse cx="102" cy="53" rx="12.5" ry="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="99.5" cy="53" rx="8" ry="9.5" fill="#29180E" />
      <ellipse cx="99" cy="54" rx="5" ry="6.5" fill="#140A04" />
      <circle cx="97" cy="49" r="3.4" fill="#FFFFFF" />
      <circle cx="102.5" cy="56.5" r="1.5" fill="#FFFFFF" />

      {/* Otter Button Nose */}
      <path
        d="M 73 63 C 73 58, 87 58, 87 63 C 87 68.5, 82 71.5, 80 71.5 C 78 71.5, 73 68.5, 73 63 Z"
        fill="#1F1713"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="77.5" cy="61.5" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.85" />

      {/* Philtrum & Cheerful Otter Mouth */}
      <path d="M 80 71.5 L 80 75" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M 72 75 C 75.5 78.5, 80 78.5, 80 75 C 80 78.5, 84.5 78.5, 88 75"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Whisker Dots */}
      <circle cx="67" cy="71" r="1.1" fill="#7A451E" />
      <circle cx="63" cy="74.5" r="1.1" fill="#7A451E" />
      <circle cx="67.5" cy="77" r="1.1" fill="#7A451E" />
      <circle cx="93" cy="71" r="1.1" fill="#7A451E" />
      <circle cx="97" cy="74.5" r="1.1" fill="#7A451E" />
      <circle cx="92.5" cy="77" r="1.1" fill="#7A451E" />

      {/* Whiskers */}
      <path d="M 61 72 C 49 70, 39 74, 32 78" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 62 76 C 49 78, 40 84, 34 89" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 99 72 C 111 70, 121 74, 128 78" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 98 76 C 111 78, 120 84, 126 89" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* Forearms & Otter Paws in Namaste */}
      {showNamaste && (
        <>
          <path
            d="M 43 96 C 40 108, 52 118, 66 114 C 72 112, 78 104, 78 96 C 69 94, 51 89, 43 96 Z"
            fill="#844F27"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M 117 96 C 120 108, 108 118, 94 114 C 88 112, 82 104, 82 96 C 91 94, 109 89, 117 96 Z"
            fill="#844F27"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <g transform="translate(71, 93)">
            <path
              d="M 4 21 L 7 3.5 C 7.5 1, 9 1, 9 3.5 L 9 21 Z"
              fill="#FFF4DF"
              stroke="#18181B"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <path
              d="M 14 21 L 11 3.5 C 10.5 1, 9 1, 9 3.5 L 9 21 Z"
              fill="#FFF4DF"
              stroke="#18181B"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <path d="M 6.5 13 L 6.5 19" stroke="#E2BF95" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 11.5 13 L 11.5 19" stroke="#E2BF95" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="9" cy="3.5" r="3" stroke="#22C55E" strokeWidth="1" strokeDasharray="1.5 1.5" />
            <circle cx="9" cy="3.5" r="1.4" fill="#22C55E" />
          </g>
        </>
      )}

      {/* Webbed Otter Feet */}
      <ellipse cx="63" cy="133" rx="8.5" ry="4.5" fill="#522C0E" stroke="#18181B" strokeWidth="2.2" />
      <circle cx="58.5" cy="134" r="1.2" fill="#FFF4DF" />
      <circle cx="63" cy="135" r="1.2" fill="#FFF4DF" />
      <circle cx="67.5" cy="134" r="1.2" fill="#FFF4DF" />

      <ellipse cx="97" cy="133" rx="8.5" ry="4.5" fill="#522C0E" stroke="#18181B" strokeWidth="2.2" />
      <circle cx="92.5" cy="134" r="1.2" fill="#FFF4DF" />
      <circle cx="97" cy="135" r="1.2" fill="#FFF4DF" />
      <circle cx="101.5" cy="134" r="1.2" fill="#FFF4DF" />
    </svg>
  );
}

export default OtterLogoIcon;
