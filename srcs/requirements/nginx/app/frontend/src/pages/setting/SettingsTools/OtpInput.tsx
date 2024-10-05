// src/OtpInput.tsx
import { useState } from 'react';

interface OtpInputProps {
  length: number;
  onChange: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onChange }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (!/^[0-9]$/.test(element.value) && element.value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextElementSibling && element.value !== '') {
      (element.nextElementSibling as HTMLInputElement).focus();
    }

    onChange(newOtp.join(''));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      if (otp[index] === '') {
        const prevElement = event.currentTarget.previousElementSibling as HTMLInputElement;
        if (prevElement) {
          prevElement.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    }
  };

  return (
    <div className='flex gap-1 text-base justify-center  text-center'>
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target as HTMLInputElement, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
		  // className='w-10 h-16 bg-black rounded-3xl text-center text-xl'
		  className='border dark:border-[#292929] h-12  rounded-2xl w-10  dark:bg-black dark:text-white mt-5 text-black text-center text-xl'
		  autoFocus={index===0}
        />
      ))}
    </div>
  );
};

export default OtpInput;
