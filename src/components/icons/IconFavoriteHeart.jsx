// Exported from Figma node 33:5 (exportAsync SVG), the heart of the card's «مفضلة». The same
// shape is 17px on the mobile details photo (83:678) and 16px on «حفظ» (65:1179): pass
// width/height. `filled` is the saved state; the outline (not saved) is not in Figma.
/** @param {{ filled?: boolean } & import('react').SVGProps<SVGSVGElement>} props */
export function IconFavoriteHeart({ filled = false, ...props }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M9 15.75C9 15.75 3.375 12.225 2.025 8.925C0.975003 6.15 2.475 3.375 5.25 3.375C6.75 3.375 7.95 4.2 9 5.625C10.05 4.2 11.25 3.375 12.75 3.375C15.525 3.375 17.025 6.15 15.975 8.925C14.625 12.225 9 15.75 9 15.75Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
