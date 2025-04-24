interface UitroeptekenIconProps {
  color?: string;
  secundaryColor?: string;
  height?: number;
}

export const UitroeptekenIcon = ({ color = 'green', secundaryColor = 'white', height = 24 }: UitroeptekenIconProps) => {
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
      {/* Uitroepteken */}
      <rect
        x="11"
        y="6"
        width="2"
        height="8"
        fill={secundaryColor}
      />
      {/* Punt onder het uitroepteken */}
      <rect
        x="11"
        y="16"
        width="2"
        height="2"
        fill={secundaryColor}
      />
    </svg>
  );
};