import React, { useState } from 'react';

interface FlippableCardProps {
  front: string;
  back: string;
  hint?: string;
  example?: string;
  className?: string;
}

const FlippableCard: React.FC<FlippableCardProps> = ({ 
  front, 
  back, 
  hint, 
  example, 
  className = '' 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`relative w-full h-64 cursor-pointer perspective-1000 ${className}`}
      onClick={handleFlip}
    >
      <div 
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${
          isFlipped ? 'rotateY-180' : 'rotateY-0'
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg p-6 h-full flex flex-col justify-center items-center">
            <div className="text-3xl font-bold mb-4 text-center">
              {front}
            </div>
            {hint && (
              <div className="text-blue-100 text-sm text-center">
                {hint}
              </div>
            )}
            <div className="absolute bottom-4 text-blue-100 text-xs">
              Tap to flip
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotateY-180">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg p-6 h-full flex flex-col justify-center items-center">
            <div className="text-2xl font-bold mb-4 text-center">
              {back}
            </div>
            {example && (
              <div className="text-green-100 text-sm text-center mb-2">
                Example: {example}
              </div>
            )}
            <div className="absolute bottom-4 text-green-100 text-xs">
              Tap to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableCard;
