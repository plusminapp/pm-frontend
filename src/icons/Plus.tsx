interface PlusIconProps {
  color?: string;
  secundaryColor?: string;
  height?: number;
}

export const PlusIcon = ({ color = 'green', secundaryColor = 'white', height = 24 }: PlusIconProps) => {
  return (
      <svg
        width={height}
        height={height}
        overflow={'visible'}
        viewBox="0 0 24 24"
        fill="#008000"
        version="1.1"
        id="svg69"
        xmlns="http://www.w3.org/2000/svg">
        <defs id="defs73" />
        <path
          d="M 0,0 H 24 V 24 H 0 Z"
          fill='none'
          id="path65" />
        <path
          d="M 12,2 C 6.48,2 2,6.48 2,12 2,17.52 6.48,22 12,22 17.52,22 22,17.52 22,12 22,6.48 17.52,2 12,2 Z"
          fill={color}
          id="circlePath" />
        <path
          d="M 17,13 H 13 V 17 H 11 V 13 H 7 V 11 H 11 V 7 H 13 V 11 H 17 Z"
          fill={secundaryColor}
          id="plusPath" />
      </svg>
  );
};
