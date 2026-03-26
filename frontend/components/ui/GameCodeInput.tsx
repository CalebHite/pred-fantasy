'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import clsx from 'clsx';

interface GameCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
}

export const GameCodeInput = ({
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
  length = 6,
}: GameCodeInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update internal values when external value changes
  useEffect(() => {
    const chars = value.toUpperCase().split('').slice(0, length);
    const newValues = [...Array(length)].map((_, i) => chars[i] || '');
    setValues(newValues);
  }, [value, length]);

  const handleChange = (index: number, inputValue: string) => {
    const char = inputValue.toUpperCase().slice(-1);

    // Only allow alphanumeric characters
    if (char && !/^[A-Z0-9]$/.test(char)) {
      return;
    }

    const newValues = [...values];
    newValues[index] = char;
    setValues(newValues);

    const newCode = newValues.join('');
    onChange(newCode);

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all boxes are filled
    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
        onChange(newValues.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const chars = pastedText.split('').slice(0, length);
    const newValues = [...Array(length)].map((_, i) => chars[i] || '');
    setValues(newValues);

    const newCode = newValues.join('');
    onChange(newCode);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex((v) => !v);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-7 justify-start pl-[52px]">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={clsx(
            'w-12 h-14 text-center text-2xl font-semibold rounded-lg border transition-all bg-white',
            'focus:outline-none focus:ring-1 focus:ring-[#25ddf9] focus:border-[#25ddf9]',
            error
              ? 'border-red-500'
              : value
              ? 'border-gray-400'
              : 'border-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Character ${index + 1}`}
        />
      ))}
    </div>
  );
};
