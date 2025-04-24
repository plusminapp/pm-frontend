interface VraagtekenIconProps {
  color?: string;
  secundaryColor?: string;
  height?: number;
}

export const VraagtekenIcon = ({ color = 'green', secundaryColor = 'white', height = 24 }: VraagtekenIconProps) => {
  return (
    <svg
      width={height}
      height={height}
      overflow={'visible'}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cirkel */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
      />
      {/* Vraagteken - Boog */}
      <path
        d="M9 7 C14 6, 15 7, 15 8.5 C15 10, 13 10.5, 13 13"
        stroke={secundaryColor}
        strokeWidth="2"
        fill="none"
      />
      {/* Vraagteken - Punt */}
      <circle
        cx="12"
        cy="16"
        r="1"
        fill={secundaryColor}
      />
    </svg>
  );
};