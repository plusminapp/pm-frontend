import React from "react";

interface StandIconProps {
  color: string; // De fill color van de cirkel
  borderColor: string; // De kleur van de rand
  height: number; // De hoogte (en breedte, omdat het een cirkel is)
  text: string | React.ReactNode; // De tekst in het midden van de cirkel
  outerText?: string; // De tekst buiten de cirkel
}

const StandIcon: React.FC<StandIconProps> = ({
  color,
  borderColor,
  height,
  text,
  outerText,
}) => {
  const radius = height / 2; // De straal van de cirkel
  const borderWidth = 10; // De dikte van de rand

  return (
    <svg
      width={height * 1.5} // Extra ruimte voor de buitenste tekst
      height={height * 1.5}
      viewBox={`0 0 ${height * 1.5} ${height * 1.5}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cirkel met vulling en rand */}
      <circle
        cx={height * 0.75}
        cy={height * 0.75}
        r={radius - borderWidth / 2} // Houd rekening met de randdikte
        fill={color}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Tekst in het midden */}
      {typeof text === 'string' &&
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={'1rem'} // Dynamische tekstgrootte
          fill="white" // Kleur van de tekst
          fontFamily="Roboto" // Lettertype gewijzigd naar Roboto
        >
          {text}
        </text>}
      {typeof text !== 'string' && (
        <foreignObject
          x="40%"
          y="40%"
          width="20%" 
          height="20%"
          color="white">
          {text}
        </foreignObject>
      )}
      {/* Tekst buiten de cirkel */}
      {outerText && (
        <text
          x="50%" // Horizontaal gecentreerd
          y={height * 1.5} // Plaats de tekst onder de cirkel
          fontSize={'0.875rem'} // Dynamische tekstgrootte voor de buitenste tekst
          fill={'#333'} // Kleur van de buitenste tekst
          textAnchor="middle" // Zorgt ervoor dat de tekst gecentreerd is
          fontFamily="Roboto" // Lettertype gewijzigd naar Roboto
        >
          {outerText}
        </text>
      )}
    </svg>
  );
};

export default StandIcon;