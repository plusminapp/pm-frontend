interface MinProps {
  color?: string;
  height?: number;
}

export const MinIcon = ({color= 'red', height= 24}: MinProps) => {
  return (
    <svg
      height={height}
      viewBox="0 0 24 24"
      fill="#008000"
      version="1.1"
      id="svg69"
      xmlns="http://www.w3.org/2000/svg">
      <defs id="defs73" />
      <path
        d="M 0,0 H 24 V 24 H 0 Z"
        fill="none"
        id="path235" />
      <path
        d="M 12,2 C 6.48,2 2,6.48 2,12 2,17.52 6.48,22 12,22 17.52,22 22,17.52 22,12 22,6.48 17.52,2 12,2 Z m 5,11 H 7 v -2 h 10 z"
        fill={color}
        id="path237" />
    </svg>
  );
};
